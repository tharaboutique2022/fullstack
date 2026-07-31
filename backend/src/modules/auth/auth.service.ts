import type { User } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.validation';

function sanitizeUser(user: User) {
  const {
    passwordHash: _passwordHash,
    resetOtpHash: _resetOtpHash,
    resetOtpExpiresAt: _resetOtpExpiresAt,
    ...safeUser
  } = user;
  return safeUser;
}

import { sendPasswordResetEmail } from '../../services/email.service';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw AppError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: 'user',
    },
  });

  await prisma.cart.create({
    data: { userId: user.id },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isValidPassword = await comparePassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return sanitizeUser(user);
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string | null }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
    },
  });

  return sanitizeUser(user);
}

export async function requestPasswordReset(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return { message: 'If an account exists for this email, a reset code has been sent.' };
  }

  const otp = generateOtp();
  const resetOtpHash = await hashPassword(otp);
  const resetOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetOtpHash, resetOtpExpiresAt },
  });

  const emailResult = await sendPasswordResetEmail(user.email, otp);

  return {
    message: 'If an account exists for this email, a reset code has been sent.',
    ...(!emailResult.sent && process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
  };
}

export async function resetPasswordWithOtp(data: ResetPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user?.resetOtpHash || !user.resetOtpExpiresAt) {
    throw AppError.badRequest('Invalid or expired reset code');
  }

  if (user.resetOtpExpiresAt.getTime() < Date.now()) {
    throw AppError.badRequest('Reset code has expired. Request a new one.');
  }

  const otpValid = await comparePassword(data.otp, user.resetOtpHash);
  if (!otpValid) {
    throw AppError.badRequest('Invalid reset code');
  }

  const passwordHash = await hashPassword(data.password);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetOtpHash: null,
      resetOtpExpiresAt: null,
    },
  });

  return sanitizeUser(updated);
}

export async function changePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const valid = await comparePassword(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Current password is incorrect');
  }

  const passwordHash = await hashPassword(data.newPassword);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return sanitizeUser(updated);
}

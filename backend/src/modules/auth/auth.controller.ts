import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { getValidatedBody } from '../../utils/validatedRequest';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from './auth.validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(getValidatedBody<RegisterInput>(req));
  sendSuccess(res, result, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(getValidatedBody<LoginInput>(req));
  sendSuccess(res, result, 'Login successful');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, user, 'Profile fetched successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(
    req.user!.id,
    getValidatedBody<UpdateProfileInput>(req)
  );
  sendSuccess(res, user, 'Profile updated successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(getValidatedBody<ForgotPasswordInput>(req));
  sendSuccess(res, result, result.message);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.changePassword(req.user!.id, getValidatedBody(req));
  sendSuccess(res, user, 'Password changed successfully');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPasswordWithOtp(getValidatedBody<ResetPasswordInput>(req));
  sendSuccess(res, null, 'Password reset successfully');
});

import nodemailer from 'nodemailer';
import { env } from '../config/env';

function getTransport() {
  if (!env.smtp.host || !env.smtp.user) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

export async function sendEmail(input: { to: string; subject: string; text: string }) {
  const transport = getTransport();
  if (!transport) {
    if (env.nodeEnv !== 'production') {
      console.info(`[email:dev] To: ${input.to}\nSubject: ${input.subject}\n${input.text}`);
    }
    return { sent: false as const, devLogged: true as const };
  }

  await transport.sendMail({
    from: env.smtp.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return { sent: true as const, devLogged: false as const };
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  return sendEmail({
    to,
    subject: `${env.appName} password reset code`,
    text: `Your password reset code is ${otp}. It expires in 15 minutes.`,
  });
}

export async function sendOrderUpdateEmail(to: string, orderNumber: string, message: string) {
  return sendEmail({
    to,
    subject: `${env.appName} order ${orderNumber} update`,
    text: message,
  });
}

export async function sendBookingUpdateEmail(to: string, bookingNumber: string, message: string) {
  return sendEmail({
    to,
    subject: `${env.appName} booking ${bookingNumber} update`,
    text: message,
  });
}

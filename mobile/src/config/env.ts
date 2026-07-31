export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  debugApi: process.env.EXPO_PUBLIC_DEBUG_API !== 'false',
  supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? '+919876543210',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'support@tharaboutique.com',
  supportWhatsApp: process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP ?? '919876543210',
} as const;

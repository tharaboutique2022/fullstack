import type { ApiClientLogger } from '@ecomm/shared/apiClient';
import { env } from '@/config/env';

const enabled = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_API !== 'false';

function logRequest(log: Parameters<NonNullable<ApiClientLogger['onRequest']>>[0]): void {
  console.log(`[API →] ${log.method} ${log.path}`);
  console.log(`        ${log.url}`);
  if (log.hasAuth) {
    console.log('        auth: bearer token attached');
  }
  if (log.body !== undefined) {
    console.log('        body:', log.body);
  }
}

function logResponse(log: Parameters<NonNullable<ApiClientLogger['onResponse']>>[0]): void {
  if (log.ok) {
    console.log(`[API ←] ${log.method} ${log.path} ${log.status} (${log.durationMs}ms)`);
    return;
  }

  const statusLabel = log.status > 0 ? String(log.status) : 'NETWORK';
  //inlcude status code in the log
  console.warn(
    `[API ✗] ${log.method} ${log.path} ${statusLabel} (${log.durationMs}ms) ${log.code ?? ''} ${log.error ?? '' } ${log.status ? `Status: ${log.status}` : ''}`.trim()
  );
}

export const apiLogger: ApiClientLogger | undefined = enabled
  ? {
      onRequest: logRequest,
      onResponse: logResponse,
    }
  : undefined;

if (enabled) {
  console.log('[API] debug logging enabled');
  console.log('[API] base URL:', env.apiBaseUrl);
}

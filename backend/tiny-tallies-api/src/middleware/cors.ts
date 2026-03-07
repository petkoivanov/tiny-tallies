/**
 * CORS and Response Helpers
 */

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-Id',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

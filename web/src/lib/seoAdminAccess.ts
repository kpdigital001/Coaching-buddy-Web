/** SEO-only session. Real credentials and GitHub token live in the Cloudflare Worker. */
export const SEO_ADMIN_SESSION_KEY = 'CB_SEO_WORKER_SESSION_V1';
const SEO_ADMIN_EMAIL = 'seo@coachingbuddy.co.in';
const endpoint = String(import.meta.env.VITE_SEO_WORKER_URL || '').replace(/\/+$/, '');

function endpointUrl(path: string): string {
  if (!endpoint || !/^https:\/\//i.test(endpoint)) {
    throw new Error('SEO publishing gateway is not configured. Set VITE_SEO_WORKER_URL before building.');
  }
  return endpoint + '/' + path;
}
export function isSeoAdminIdentityAllowed(email?: string | null, _role?: string | null): boolean {
  return String(email || '').trim().toLowerCase() === SEO_ADMIN_EMAIL;
}
export function clearSeoAdminSession(): void {
  sessionStorage.removeItem(SEO_ADMIN_SESSION_KEY);
  sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V3');
  sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V2');
  sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V1');
}
function readToken(): string { return sessionStorage.getItem(SEO_ADMIN_SESSION_KEY) || ''; }
async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(result.error || 'SEO service error (' + response.status + ')'));
  return result as T;
}
export async function getSeoAdminSession(): Promise<boolean> {
  const token = readToken();
  if (!token) return false;
  try {
    const result = await fetch(endpointUrl('session'), {
      headers: { Authorization: 'Bearer ' + token }, cache: 'no-store',
    });
    await parseResponse<{ authenticated: boolean }>(result);
    return true;
  } catch { clearSeoAdminSession(); return false; }
}
export async function seoAdminLogin(email: string, password: string): Promise<void> {
  const result = await fetch(endpointUrl('login'), {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await parseResponse<{ token: string }>(result);
  if (!data.token) throw new Error('SEO service did not return a valid session.');
  clearSeoAdminSession();
  sessionStorage.setItem(SEO_ADMIN_SESSION_KEY, data.token);
}
export async function seoAdminRequest<T>(
  action: 'published' | 'publish' | 'remove',
  body?: Record<string, unknown>,
): Promise<T> {
  const token = readToken();
  if (!token) throw new Error('SEO session expired. Please log in again.');
  const result = await fetch(endpointUrl(action), {
    method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(result);
}

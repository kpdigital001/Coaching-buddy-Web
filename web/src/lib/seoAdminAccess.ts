/** Dedicated server-verified SEO session. No SEO password/verifier in public JS. */
const SEO_ENDPOINT = '/seo-publisher/api.php';
let csrfToken = '';

async function parseJson(response: Response): Promise<any> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || `SEO request failed (${response.status})`);
  return payload;
}

export async function getSeoAdminSession(): Promise<boolean> {
  const response = await fetch(`${SEO_ENDPOINT}?action=session`, { credentials: 'same-origin', cache: 'no-store' });
  const payload = await parseJson(response);
  csrfToken = payload.authenticated ? String(payload.csrf || '') : '';
  return Boolean(payload.authenticated);
}

export async function seoAdminLogin(email: string, password: string): Promise<void> {
  const response = await fetch(`${SEO_ENDPOINT}?action=login`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const payload = await parseJson(response);
  csrfToken = String(payload.csrf || '');
  if (!csrfToken) throw new Error('SEO login did not return a secure session token.');
}

export async function seoAdminRequest<T = any>(action: string, body?: Record<string, any>): Promise<T> {
  if (body !== undefined && !csrfToken) {
    if (!await getSeoAdminSession()) throw new Error('SEO session expired. Sign in again.');
  }
  const response = await fetch(`${SEO_ENDPOINT}?action=${encodeURIComponent(action)}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json', 'X-CB-SEO-CSRF': csrfToken },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseJson(response) as Promise<T>;
}

export async function seoAdminLogout(): Promise<void> {
  try {
    if (!csrfToken) await getSeoAdminSession();
    if (csrfToken) await seoAdminRequest('logout', {});
  } finally {
    csrfToken = '';
    // Remove obsolete previous frontend-only auth tokens.
    sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V3');
    sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V2');
    sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V1');
  }
}
/** Legacy institute login still imports this helper; preserve its SEO-only return route. */
export function isSeoAdminIdentityAllowed(email?: string | null, _role?: string | null): boolean {
  return String(email || '').trim().toLowerCase() === 'seo@coachingbuddy.co.in';
}

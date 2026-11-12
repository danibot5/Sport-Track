export const PUBLIC_ROUTES = ['login', 'register'];
export const DEFAULT_PRIVATE_ROUTE = 'dashboard';
export const DEFAULT_PUBLIC_ROUTE = 'login';

export function parseHash(hash) {
  const clean = String(hash ?? '').replace(/^#\/?/, '').split('?')[0];
  const segments = clean.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: segments[0] ?? '', params: segments.slice(1) };
}

export function resolveRoute(hash, isLoggedIn, knownRoutes) {
  const { name, params } = parseHash(hash);
  if (!isLoggedIn) {
    if (PUBLIC_ROUTES.includes(name)) {
      return { name, params, redirect: false };
    }
    return { name: DEFAULT_PUBLIC_ROUTE, params: [], redirect: true };
  }
  if (PUBLIC_ROUTES.includes(name) || !knownRoutes.includes(name)) {
    return { name: DEFAULT_PRIVATE_ROUTE, params: [], redirect: true };
  }
  return { name, params, redirect: false };
}

export function navigate(name, ...params) {
  const path = [name, ...params.map(encodeURIComponent)].join('/');
  window.location.hash = `#/${path}`;
}

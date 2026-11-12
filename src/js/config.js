export function normalizeSupabaseUrl(value) {
  return String(value ?? '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/(rest|auth)\/v1$/, '')
    .replace(/\/+$/, '');
}

export function isValidConfig(url, key) {
  return /^https:\/\/[^/\s]+$/.test(url) && Boolean(key) && !url.includes('your-project-ref');
}

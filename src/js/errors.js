import { t } from './i18n.js';

const AUTH_MESSAGES = [
  ['invalid login credentials', 'err.credentials'],
  ['email not confirmed', 'err.notConfirmed'],
  ['user already registered', 'err.registered'],
  ['password should be at least', 'err.passwordShort'],
  ['unable to validate email', 'err.emailInvalid'],
  ['email address', 'err.emailRejected'],
  ['rate limit', 'err.rateLimit'],
  ['invalid api key', 'err.invalidKey'],
  ['no api key', 'err.noKey'],
  ['secret api key', 'err.secretKey'],
  ['requested path is invalid', 'err.badUrl'],
  ['invalid path', 'err.badUrl'],
  ['failed to fetch', 'err.network'],
  ['network', 'err.network']
];

const DB_MESSAGES = {
  '23505': 'err.duplicate',
  '23503': 'err.inUse',
  '23514': 'err.outOfRange',
  '23502': 'err.required',
  '42501': 'err.forbidden',
  'PGRST301': 'err.session'
};

export function translateError(error) {
  if (!error) {
    return '';
  }
  if (error.code && DB_MESSAGES[error.code]) {
    return t(DB_MESSAGES[error.code]);
  }
  const text = String(error.message ?? error).toLowerCase();
  const match = AUTH_MESSAGES.find(([needle]) => text.includes(needle));
  if (match) {
    return t(match[1]);
  }
  if (error.status === 404) {
    return t('err.notFound');
  }
  if (error.status >= 500) {
    return t('err.server');
  }
  console.error('SportTrack: unknown error', error);
  return t('err.unexpected');
}

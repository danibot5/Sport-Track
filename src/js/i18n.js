import bg from './lang/bg.js';
import en from './lang/en.js';

export const TRANSLATIONS = { bg, en };

const LOCALES = { bg: 'bg-BG', en: 'en-GB' };
const STORAGE_KEY = 'sporttrack-lang';

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let currentLang = TRANSLATIONS[readStoredLang()] ? readStoredLang() : 'bg';

export function getLang() {
  return currentLang;
}

export function getLocale() {
  return LOCALES[currentLang];
}

export function t(key, params = {}) {
  const text = TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.bg[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match));
}

export function tn(key, count) {
  return t(`${key}.${count === 1 ? 'one' : 'many'}`, { n: count });
}

export function translate(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nLabel));
  });
}

export function setLang(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : 'bg';
  document.documentElement.lang = currentLang;
  try {
    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch {
    return;
  }
}

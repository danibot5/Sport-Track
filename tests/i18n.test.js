import { describe, expect, it } from 'vitest';
import { getLang, setLang, t, TRANSLATIONS } from '../src/js/i18n.js';

describe('i18n', () => {
  it('has the same keys in Bulgarian and English', () => {
    expect(Object.keys(TRANSLATIONS.en).sort()).toEqual(Object.keys(TRANSLATIONS.bg).sort());
  });

  it('defaults to Bulgarian', () => {
    expect(getLang()).toBe('bg');
    expect(t('nav.dashboard')).toBe('Табло');
  });

  it('switches to English and falls back to the key for unknown text', () => {
    globalThis.document = { documentElement: {} };
    setLang('en');
    expect(t('nav.dashboard')).toBe('Dashboard');
    expect(t('missing.key')).toBe('missing.key');
    setLang('xx');
    expect(getLang()).toBe('bg');
  });
});

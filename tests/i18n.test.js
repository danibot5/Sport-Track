import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../src/js/format.js';
import { getLang, setLang, t, tn, TRANSLATIONS } from '../src/js/i18n.js';

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

function usedKeys() {
  const keys = new Set();
  sourceFiles('src').filter((file) => /\.(js|html)$/.test(file)).forEach((file) => {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\bt\('([\w.]+)'/g)) keys.add(match[1]);
    for (const match of text.matchAll(/\btn\('([\w.]+)'/g)) {
      keys.add(`${match[1]}.one`);
      keys.add(`${match[1]}.many`);
    }
    for (const match of text.matchAll(/data-i18n(?:-label)?="([\w.]+)"/g)) keys.add(match[1]);
  });
  CATEGORIES.forEach((id) => keys.add(`category.${id}`));
  ['workouts_per_week', 'weekly_volume', 'custom'].forEach((type) => keys.add(`goalType.${type}`));
  ['login', 'register', 'dashboard', 'workouts', 'plans', 'exercises', 'goals', 'progress'].forEach((route) => keys.add(`nav.${route}`));
  return [...keys];
}

describe('i18n', () => {
  it('has the same keys in Bulgarian and English', () => {
    expect(Object.keys(TRANSLATIONS.en).sort()).toEqual(Object.keys(TRANSLATIONS.bg).sort());
  });

  it('has a translation in both languages for every key used in the code', () => {
    const missing = usedKeys().filter((key) => !TRANSLATIONS.bg[key] || !TRANSLATIONS.en[key]);
    expect(missing).toEqual([]);
  });

  it('defaults to Bulgarian', () => {
    expect(getLang()).toBe('bg');
    expect(t('nav.dashboard')).toBe('Табло');
  });

  it('fills in values and picks singular or plural', () => {
    expect(t('dash.hello', { name: 'Ани' })).toBe('Здравей, Ани!');
    expect(tn('plural.sets', 1)).toBe('1 серия');
    expect(tn('plural.sets', 3)).toBe('3 серии');
  });

  it('switches to English and falls back to the key for unknown text', () => {
    globalThis.document = { documentElement: {} };
    setLang('en');
    expect(t('nav.dashboard')).toBe('Dashboard');
    expect(tn('plural.sets', 1)).toBe('1 set');
    expect(t('missing.key')).toBe('missing.key');
    setLang('xx');
    expect(getLang()).toBe('bg');
  });
});

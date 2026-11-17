import { getLocale } from './i18n.js';

export const CATEGORIES = ['strength', 'cardio', 'flexibility', 'other'];

export function parseIsoDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(parseIsoDate(value));
}

export function formatShortDate(value) {
  const date = parseIsoDate(value);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

export function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

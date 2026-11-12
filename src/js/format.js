const dateFormatter = new Intl.DateTimeFormat('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
const numberFormatter = new Intl.NumberFormat('bg-BG', { maximumFractionDigits: 2 });

export const CATEGORY_LABELS = {
  strength: 'Сила',
  cardio: 'Кардио',
  flexibility: 'Гъвкавост',
  other: 'Друго'
};

export const GOAL_TYPE_LABELS = {
  workouts_per_week: 'Тренировки седмично',
  weekly_volume: 'Седмичен обем',
  custom: 'Лична цел'
};

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
  return dateFormatter.format(parseIsoDate(value));
}

export function formatShortDate(value) {
  const date = parseIsoDate(value);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
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

export function pluralize(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

// Алгоритъм за тренировъчно натоварване и седмичен прогрес (Issue #37).
//
// Вход:   масив от тренировки { workout_date: 'YYYY-MM-DD', workout_items: [{ repetitions, weight_kg, duration_minutes }] }
//         и днешна дата (по подразбиране – сега).
// Стъпки: 1. Обемът на една серия е повторения × тежест (kg), само ако и двете са положителни числа.
//         2. Серии без тежест (лицеви опори, бягане) дават обем 0, а продължителността им се събира отделно в минути.
//         3. Всяка тренировка се слага в календарната седмица (понеделник–неделя), в която е датата ѝ.
//         4. За всяка седмица се сумират брой тренировки, серии, обем и минути.
//         5. Промяната е ((текущ − предходен) / предходен) × 100, закръглена до 0,1.
//            При предходен обем 0 няма база за сравнение и промяната е null (без деление на нула).
// Изход:  седмици { weekStart, workouts, sets, volume, minutes } и обобщение { current, previous, change, trend }.
// Гранични случаи: празен масив, тренировка без серии, липсваща/отрицателна/нечислова стойност,
//         дробна тежест (27,5 kg), бъдещи и много стари дати (не влизат в нито една седмица).
// Сложност: O(n + w) време и O(w) памет, където n е броят серии, а w – броят седмици.
//         Всяка серия се обхожда точно веднъж, а седмицата се намира с аритметика, без търсене.

import { addDays, parseIsoDate, startOfWeek, toIsoDate } from './format.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function positive(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function setVolume(item) {
  return round(positive(item?.repetitions) * positive(item?.weight_kg));
}

export function workoutVolume(workout) {
  return round((workout?.workout_items ?? []).reduce((sum, item) => sum + setVolume(item), 0));
}

export function workoutMinutes(workout) {
  return (workout?.workout_items ?? []).reduce((sum, item) => sum + positive(item.duration_minutes), 0);
}

function weekIndex(firstStart, date) {
  return Math.round((startOfWeek(date) - firstStart) / (7 * DAY_MS));
}

export function weeklyLoad(workouts, weeks = 8, today = new Date()) {
  const count = Math.max(1, Math.floor(weeks));
  const firstStart = addDays(startOfWeek(today), -7 * (count - 1));
  const buckets = Array.from({ length: count }, (_, index) => ({
    weekStart: toIsoDate(addDays(firstStart, 7 * index)),
    workouts: 0,
    sets: 0,
    volume: 0,
    minutes: 0
  }));

  (workouts ?? []).forEach((workout) => {
    const bucket = buckets[weekIndex(firstStart, parseIsoDate(workout.workout_date))];
    if (!bucket) {
      return;
    }
    const items = workout.workout_items ?? [];
    bucket.workouts += 1;
    bucket.sets += items.length;
    bucket.volume = round(bucket.volume + workoutVolume(workout));
    bucket.minutes += workoutMinutes(workout);
  });

  return buckets;
}

export function percentChange(current, previous) {
  if (!(previous > 0)) {
    return null;
  }
  return round(((current - previous) / previous) * 100, 1);
}

export function trend(change) {
  if (change === null) {
    return 'none';
  }
  if (change > 0) {
    return 'up';
  }
  if (change < 0) {
    return 'down';
  }
  return 'same';
}

export function loadSummary(workouts, today = new Date()) {
  const [previous, current] = weeklyLoad(workouts, 2, today);
  const change = percentChange(current.volume, previous.volume);
  return { current, previous, change, trend: trend(change) };
}

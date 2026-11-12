import { addDays, parseIsoDate, startOfWeek, toIsoDate } from './format.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function setCount(workout) {
  return workout.workout_items?.[0]?.count ?? 0;
}

export function workoutsInWeek(workouts, today = new Date()) {
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 7);
  return workouts.filter((workout) => {
    const date = parseIsoDate(workout.workout_date);
    return date >= weekStart && date < weekEnd;
  });
}

export function weeklyWorkoutCounts(workouts, weeks = 8, today = new Date()) {
  const currentWeekStart = startOfWeek(today);
  const buckets = [];
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const start = addDays(currentWeekStart, -7 * index);
    buckets.push({ weekStart: toIsoDate(start), workouts: 0, sets: 0 });
  }
  const firstStart = parseIsoDate(buckets[0].weekStart);
  workouts.forEach((workout) => {
    const date = parseIsoDate(workout.workout_date);
    if (date < firstStart) {
      return;
    }
    const bucketIndex = Math.round((startOfWeek(date) - firstStart) / WEEK_MS);
    const bucket = buckets[bucketIndex];
    if (bucket) {
      bucket.workouts += 1;
      bucket.sets += setCount(workout);
    }
  });
  return buckets;
}

export function goalProgress(goal, workoutsThisWeek) {
  if (goal.completed) {
    return 100;
  }
  if (goal.goal_type !== 'workouts_per_week') {
    return null;
  }
  const target = Number(goal.target_value);
  if (!(target > 0)) {
    return null;
  }
  return Math.min(100, Math.round((workoutsThisWeek / target) * 100));
}

import { describe, expect, it, vi } from 'vitest';
import { parseHash, resolveRoute } from '../src/js/router.js';
import { goalProgress, weeklyWorkoutCounts, workoutsInWeek } from '../src/js/stats.js';
import { translateError } from '../src/js/errors.js';
import { isValidConfig, normalizeSupabaseUrl } from '../src/js/config.js';

const ROUTES = ['login', 'register', 'dashboard', 'workouts', 'plans', 'exercises', 'goals', 'progress'];

describe('router', () => {
  it('разделя hash на име и параметри', () => {
    expect(parseHash('#/workouts/abc-123')).toEqual({ name: 'workouts', params: ['abc-123'] });
    expect(parseHash('')).toEqual({ name: '', params: [] });
  });

  it('пренасочва невлязъл потребител към вход', () => {
    expect(resolveRoute('#/dashboard', false, ROUTES)).toMatchObject({ name: 'login', redirect: true });
  });

  it('пренасочва влязъл потребител от вход към таблото', () => {
    expect(resolveRoute('#/login', true, ROUTES)).toMatchObject({ name: 'dashboard', redirect: true });
  });

  it('пренасочва непознат адрес към таблото', () => {
    expect(resolveRoute('#/nothing', true, ROUTES)).toMatchObject({ name: 'dashboard', redirect: true });
  });
});

describe('stats', () => {
  const today = new Date(2026, 10, 12);
  const workouts = [
    { workout_date: '2026-11-12', workout_items: [{ count: 4 }] },
    { workout_date: '2026-11-09', workout_items: [{ count: 2 }] },
    { workout_date: '2026-11-08', workout_items: [{ count: 3 }] },
    { workout_date: '2026-10-01', workout_items: [{ count: 1 }] }
  ];

  it('брои тренировките от понеделник до неделя', () => {
    expect(workoutsInWeek(workouts, today)).toHaveLength(2);
  });

  it('групира тренировки и серии по седмици', () => {
    const weeks = weeklyWorkoutCounts(workouts, 2, today);
    expect(weeks).toEqual([
      { weekStart: '2026-11-02', workouts: 1, sets: 3 },
      { weekStart: '2026-11-09', workouts: 2, sets: 6 }
    ]);
  });

  it('изчислява напредък към седмична цел без да надхвърля 100%', () => {
    const goal = { goal_type: 'workouts_per_week', target_value: 3, completed: false };
    expect(goalProgress(goal, 2)).toBe(67);
    expect(goalProgress(goal, 5)).toBe(100);
    expect(goalProgress({ ...goal, goal_type: 'custom' }, 2)).toBeNull();
  });
});

describe('translateError', () => {
  it('превежда грешка при вход', () => {
    expect(translateError({ message: 'Invalid login credentials' })).toBe('Грешен имейл или парола.');
  });

  it('превежда нарушена уникалност', () => {
    expect(translateError({ code: '23505', message: 'duplicate key' })).toBe('Вече съществува запис с това име.');
  });

  it('връща общо съобщение за непозната грешка и я записва в конзолата', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(translateError({ message: 'boom' })).toMatch('неочаквана');
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('подсказва за грешен адрес при отговор 404', () => {
    expect(translateError({ message: 'Not Found', status: 404 })).toMatch('VITE_SUPABASE_URL');
  });

  it('разпознава невалиден API ключ', () => {
    expect(translateError({ message: 'Invalid API key' })).toMatch('.env');
  });
});

describe('config', () => {
  it('премахва /rest/v1/ и наклонени черти от адреса', () => {
    expect(normalizeSupabaseUrl('https://abc.supabase.co/rest/v1/')).toBe('https://abc.supabase.co');
    expect(normalizeSupabaseUrl(' https://abc.supabase.co/ ')).toBe('https://abc.supabase.co');
    expect(normalizeSupabaseUrl('https://abc.supabase.co/auth/v1')).toBe('https://abc.supabase.co');
  });

  it('приема само попълнена конфигурация', () => {
    expect(isValidConfig('https://abc.supabase.co', 'sb_publishable_x')).toBe(true);
    expect(isValidConfig('https://your-project-ref.supabase.co', 'x')).toBe(false);
    expect(isValidConfig('https://abc.supabase.co', '')).toBe(false);
    expect(isValidConfig('abc.supabase.co', 'x')).toBe(false);
  });
});

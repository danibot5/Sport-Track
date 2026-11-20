import { describe, expect, it } from 'vitest';
import { loadSummary, percentChange, setVolume, trend, weeklyLoad, workoutMinutes, workoutVolume } from '../src/js/algorithm.js';

const today = new Date(2026, 10, 12); // четвъртък, 12.11.2026; седмицата започва на 09.11

function sets(count, repetitions, weight_kg) {
  return Array.from({ length: count }, () => ({ repetitions, weight_kg, duration_minutes: null }));
}

// Ръчен пример 2 от docs/TESTS.md
const fullBodyWorkout = {
  workout_date: '2026-11-10',
  workout_items: [
    ...sets(3, 8, 42.5),
    { repetitions: 8, weight_kg: 30 },
    { repetitions: 8, weight_kg: 30 },
    { repetitions: 6, weight_kg: 30 },
    ...sets(3, 10, 27.5),
    { repetitions: null, weight_kg: null, duration_minutes: 1 },
    { repetitions: null, weight_kg: null, duration_minutes: 1 }
  ]
};

describe('setVolume', () => {
  it('умножава повторения по тежест (ръчен пример 1)', () => {
    expect(setVolume({ repetitions: 8, weight_kg: 40 })).toBe(320);
  });

  it('работи с дробна тежест и стойности като текст', () => {
    expect(setVolume({ repetitions: '10', weight_kg: '27.5' })).toBe(275);
  });

  it('дава 0 за серия без тежест, с отрицателна или нечислова стойност', () => {
    expect(setVolume({ repetitions: 15, weight_kg: null })).toBe(0);
    expect(setVolume({ repetitions: 15, weight_kg: 0 })).toBe(0);
    expect(setVolume({ repetitions: -5, weight_kg: 20 })).toBe(0);
    expect(setVolume({ repetitions: 'abc', weight_kg: 20 })).toBe(0);
    expect(setVolume(null)).toBe(0);
  });
});

describe('workoutVolume и workoutMinutes', () => {
  it('сумира обема на всички серии (ръчен пример 2)', () => {
    expect(workoutVolume(fullBodyWorkout)).toBe(2505);
  });

  it('пази продължителността отделно от обема', () => {
    expect(workoutMinutes(fullBodyWorkout)).toBe(2);
    expect(workoutMinutes({ workout_items: [{ duration_minutes: 20 }, { duration_minutes: 22 }] })).toBe(42);
  });

  it('връща 0 за тренировка без серии', () => {
    expect(workoutVolume({ workout_date: '2026-11-10', workout_items: [] })).toBe(0);
    expect(workoutVolume({})).toBe(0);
  });
});

describe('weeklyLoad', () => {
  it('връща празни седмици без тренировки', () => {
    expect(weeklyLoad([], 2, today)).toEqual([
      { weekStart: '2026-11-02', workouts: 0, sets: 0, volume: 0, minutes: 0 },
      { weekStart: '2026-11-09', workouts: 0, sets: 0, volume: 0, minutes: 0 }
    ]);
  });

  it('слага неделя в същата седмица като понеделник', () => {
    const weeks = weeklyLoad(
      [
        { workout_date: '2026-11-02', workout_items: sets(1, 10, 10) },
        { workout_date: '2026-11-08', workout_items: sets(1, 10, 20) },
        { workout_date: '2026-11-09', workout_items: sets(1, 10, 30) }
      ],
      2,
      today
    );
    expect(weeks.map((week) => week.volume)).toEqual([300, 300]);
    expect(weeks.map((week) => week.workouts)).toEqual([2, 1]);
  });

  it('пропуска стари и бъдещи тренировки', () => {
    const weeks = weeklyLoad(
      [
        { workout_date: '2026-10-01', workout_items: sets(1, 10, 100) },
        { workout_date: '2026-11-16', workout_items: sets(1, 10, 100) }
      ],
      2,
      today
    );
    expect(weeks.every((week) => week.workouts === 0 && week.volume === 0)).toBe(true);
  });

  it('брои серии, обем и минути за седмицата', () => {
    const [current] = weeklyLoad([fullBodyWorkout], 1, today);
    expect(current).toEqual({ weekStart: '2026-11-09', workouts: 1, sets: 11, volume: 2505, minutes: 2 });
  });

  it('приема поне една седмица при невалиден брой', () => {
    expect(weeklyLoad([], 0, today)).toHaveLength(1);
  });
});

describe('percentChange и trend', () => {
  it('изчислява ръст и спад (ръчен пример 3)', () => {
    expect(percentChange(2500, 2000)).toBe(25);
    expect(percentChange(1200, 1600)).toBe(-25);
    expect(percentChange(2120, 2000)).toBe(6);
  });

  it('закръгля до една десета', () => {
    expect(percentChange(1000, 3000)).toBe(-66.7);
  });

  it('няма база за сравнение при предходен обем 0', () => {
    expect(percentChange(500, 0)).toBeNull();
    expect(trend(null)).toBe('none');
  });

  it('определя посоката на промяната', () => {
    expect(trend(12.5)).toBe('up');
    expect(trend(-3)).toBe('down');
    expect(trend(0)).toBe('same');
  });
});

describe('loadSummary', () => {
  it('сравнява текущата с предходната седмица', () => {
    const summary = loadSummary(
      [
        { workout_date: '2026-11-03', workout_items: sets(5, 10, 40) },
        fullBodyWorkout
      ],
      today
    );
    expect(summary.previous.volume).toBe(2000);
    expect(summary.current.volume).toBe(2505);
    expect(summary.change).toBe(25.3);
    expect(summary.trend).toBe('up');
  });

  it('не дели на нула при първа седмица', () => {
    const summary = loadSummary([fullBodyWorkout], today);
    expect(summary.change).toBeNull();
    expect(summary.trend).toBe('none');
  });
});

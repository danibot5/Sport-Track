// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const exercises = [
  { id: 'squat', user_id: null, name: 'Клек с щанга', category: 'strength', uses_weight: true },
  { id: 'own', user_id: 'u1', name: 'Мое упражнение', category: 'other', uses_weight: true }
];
const plan = {
  id: 'p1',
  name: 'Цяло тяло А',
  description: '',
  plan_items: [{ id: 'i1', position: 1, target_sets: 3, target_reps: 8, target_weight_kg: 40, target_duration_minutes: null, exercise: exercises[0] }]
};

vi.mock('../src/js/api.js', () => ({
  fetchExercises: vi.fn(async () => exercises),
  fetchPlans: vi.fn(async () => [plan]),
  fetchPlan: vi.fn(async (id) => (id === 'p1' ? plan : null)),
  fetchWorkout: vi.fn(async () => null),
  fetchWorkouts: vi.fn(async () => []),
  createWorkout: vi.fn(async () => ({ id: 'w1' })),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  createExercise: vi.fn(),
  deleteExercise: vi.fn(),
  updateExercise: vi.fn(async (id, values) => ({ ...exercises[1], name: values.name })),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  deletePlan: vi.fn()
}));
vi.mock('../src/js/auth.js', () => ({ getUser: () => ({ id: 'u1' }) }));

const api = await import('../src/js/api.js');
const { renderWorkouts } = await import('../src/js/views/workouts.js');
const { renderExercises } = await import('../src/js/views/exercises.js');

const isCurrent = () => true;

beforeEach(() => {
  document.body.innerHTML = '<main id="main"></main><div id="toast-region"></div>';
  window.location.hash = '';
  vi.clearAllMocks();
});

describe('форма за тренировка', () => {
  it('попълва сериите от плана и показва обема (#32)', async () => {
    window.location.hash = '#/workouts/new/p1';
    await renderWorkouts({ params: ['new', 'p1'], isCurrent });
    const rows = document.querySelectorAll('[data-row]');
    expect(rows).toHaveLength(3);
    expect(rows[0].querySelector('[data-field="exerciseId"]').value).toBe('squat');
    expect(document.querySelector('#workout-title').value).toBe('Цяло тяло А');
    expect(document.querySelector('#workout-plan').value).toBe('p1');
    expect(document.querySelector('#workout-volume').textContent).toContain('960');
  });

  it('не записва невалидна серия и показва грешката до нея', async () => {
    window.location.hash = '#/workouts/new';
    await renderWorkouts({ params: ['new'], isCurrent });
    document.querySelector('#workout-title').value = 'Тест';
    document.querySelector('#workout-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(api.createWorkout).not.toHaveBeenCalled();
    expect(document.querySelector('[data-row-error]').textContent).toContain('Изберете упражнение.');
  });

  it('записва коректна тренировка', async () => {
    window.location.hash = '#/workouts/new/p1';
    await renderWorkouts({ params: ['new', 'p1'], isCurrent });
    document.querySelector('#workout-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(api.createWorkout).toHaveBeenCalledOnce());
    expect(api.createWorkout.mock.calls[0][0].sets).toHaveLength(3);
  });

  it('показва съобщение за несъществуващ план', async () => {
    await renderWorkouts({ params: ['new', 'missing'], isCurrent });
    expect(document.querySelector('#workout-form')).toBeNull();
    expect(document.body.textContent).toContain('Планът не е намерен');
  });
});

describe('упражнения', () => {
  it('позволява редакция само на собствените упражнения (#34)', async () => {
    await renderExercises({ isCurrent });
    const editButtons = document.querySelectorAll('[data-edit]');
    expect(editButtons).toHaveLength(1);
    expect(editButtons[0].dataset.edit).toBe('own');

    editButtons[0].click();
    const form = document.querySelector('#exercise-form');
    expect(form.elements.name.value).toBe('Мое упражнение');
    form.elements.name.value = 'Ново име';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(api.updateExercise).toHaveBeenCalledWith('own', expect.objectContaining({ name: 'Ново име' })));
  });
});

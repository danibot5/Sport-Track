import { fetchWorkout, fetchWorkouts } from '../api.js';
import { formatDate, formatNumber, pluralize } from '../format.js';
import { setCount } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';

function describeSet(item) {
  const parts = [];
  if (item.repetitions !== null) {
    parts.push(`${item.repetitions} повт.`);
  }
  if (item.weight_kg !== null && Number(item.weight_kg) > 0) {
    parts.push(`${formatNumber(item.weight_kg)} kg`);
  }
  if (item.duration_minutes !== null) {
    parts.push(`${item.duration_minutes} мин`);
  }
  return parts.join(' × ') || '—';
}

function groupByExercise(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.exercise?.id ?? 'unknown';
    if (!groups.has(key)) {
      groups.set(key, { name: item.exercise?.name ?? 'Неизвестно упражнение', sets: [] });
    }
    groups.get(key).sets.push(item);
  });
  return [...groups.values()];
}

async function renderWorkoutList(isCurrent) {
  const workouts = await fetchWorkouts();
  if (!isCurrent()) {
    return;
  }
  const listHtml = workouts.length === 0
    ? '<p class="empty">Все още нямате записани тренировки.</p>'
    : `
      <ul class="list">
        ${workouts.map((workout) => `
          <li>
            <a class="list-item list-link" href="#/workouts/${workout.id}">
              <div class="list-item-main">
                <p class="list-item-title">${escapeHtml(workout.title)}</p>
                <p class="list-item-meta">${formatDate(workout.workout_date)} · ${pluralize(setCount(workout), 'серия', 'серии')}</p>
              </div>
              ${workout.plan ? `<span class="badge">${escapeHtml(workout.plan.name)}</span>` : ''}
            </a>
          </li>`).join('')}
      </ul>`;

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>Тренировки</h1>
          <p>История на записаните тренировки, от най-новата.</p>
        </div>
      </div>
      <div class="card">${listHtml}</div>
    </section>
  `);
}

async function renderWorkoutDetail(id, isCurrent) {
  const workout = await fetchWorkout(id);
  if (!isCurrent()) {
    return;
  }
  if (!workout) {
    setView(`
      <section>
        <a class="back-link" href="#/workouts">← Към тренировките</a>
        <p class="empty">Тренировката не е намерена или нямате достъп до нея.</p>
      </section>
    `);
    return;
  }
  const groups = groupByExercise(workout.workout_items);

  setView(`
    <section>
      <a class="back-link" href="#/workouts">← Към тренировките</a>
      <div class="page-head">
        <div>
          <h1>${escapeHtml(workout.title)}</h1>
          <p>${formatDate(workout.workout_date)}${workout.plan ? ` · по план „${escapeHtml(workout.plan.name)}“` : ''}</p>
        </div>
      </div>
      ${workout.notes ? `<div class="card"><p>${escapeHtml(workout.notes)}</p></div>` : ''}
      ${groups.length === 0 ? '<p class="empty">Тренировката няма записани серии.</p>' : ''}
      ${groups.map((group) => `
        <div class="card">
          <div class="card-head">
            <h2>${escapeHtml(group.name)}</h2>
            <span class="badge">${pluralize(group.sets.length, 'серия', 'серии')}</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th scope="col">Серия</th><th scope="col">Изпълнение</th></tr></thead>
              <tbody>
                ${group.sets.map((item) => `<tr><td>${item.set_number}</td><td>${describeSet(item)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`).join('')}
    </section>
  `);
}

export async function renderWorkouts({ params, isCurrent }) {
  if (params[0]) {
    await renderWorkoutDetail(params[0], isCurrent);
    return;
  }
  await renderWorkoutList(isCurrent);
}

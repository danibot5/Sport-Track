import { fetchWorkout, fetchWorkouts } from '../api.js';
import { formatDate, formatNumber } from '../format.js';
import { t, tn } from '../i18n.js';
import { setCount } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';

function describeSet(item) {
  const parts = [];
  if (item.repetitions !== null) {
    parts.push(t('unit.reps', { n: item.repetitions }));
  }
  if (item.weight_kg !== null && Number(item.weight_kg) > 0) {
    parts.push(`${formatNumber(item.weight_kg)} kg`);
  }
  if (item.duration_minutes !== null) {
    parts.push(t('unit.minutes', { n: item.duration_minutes }));
  }
  return parts.join(' × ') || '—';
}

function groupByExercise(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.exercise?.id ?? 'unknown';
    if (!groups.has(key)) {
      groups.set(key, { name: item.exercise?.name ?? t('wo.unknownExercise'), sets: [] });
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
    ? `<p class="empty">${t('dash.noWorkouts')}</p>`
    : `
      <ul class="list">
        ${workouts.map((workout) => `
          <li>
            <a class="list-item list-link" href="#/workouts/${workout.id}">
              <div class="list-item-main">
                <p class="list-item-title">${escapeHtml(workout.title)}</p>
                <p class="list-item-meta">${formatDate(workout.workout_date)} · ${tn('plural.sets', setCount(workout))}</p>
              </div>
              ${workout.plan ? `<span class="badge">${escapeHtml(workout.plan.name)}</span>` : ''}
            </a>
          </li>`).join('')}
      </ul>`;

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.workouts')}</h1>
          <p>${t('wo.subtitle')}</p>
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
        <a class="back-link" href="#/workouts">${t('wo.back')}</a>
        <p class="empty">${t('wo.notFound')}</p>
      </section>
    `);
    return;
  }
  const groups = groupByExercise(workout.workout_items);

  setView(`
    <section>
      <a class="back-link" href="#/workouts">${t('wo.back')}</a>
      <div class="page-head">
        <div>
          <h1>${escapeHtml(workout.title)}</h1>
          <p>${formatDate(workout.workout_date)}${workout.plan ? ` · ${t('wo.byPlan', { name: escapeHtml(workout.plan.name) })}` : ''}</p>
        </div>
      </div>
      ${workout.notes ? `<div class="card"><p>${escapeHtml(workout.notes)}</p></div>` : ''}
      ${groups.length === 0 ? `<p class="empty">${t('wo.noSets')}</p>` : ''}
      ${groups.map((group) => `
        <div class="card">
          <div class="card-head">
            <h2>${escapeHtml(group.name)}</h2>
            <span class="badge">${tn('plural.sets', group.sets.length)}</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th scope="col">${t('wo.set')}</th><th scope="col">${t('wo.performance')}</th></tr></thead>
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

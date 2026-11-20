import { createWorkout, deleteWorkout, fetchExercises, fetchPlan, fetchPlans, fetchWorkout, fetchWorkouts, updateWorkout } from '../api.js';
import { workoutVolume } from '../algorithm.js';
import { translateError } from '../errors.js';
import { exerciseOptions, numberField, readRows, renumberRows, showRowErrors, uid } from '../formRows.js';
import { formatDate, formatNumber, toIsoDate } from '../format.js';
import { t, tn } from '../i18n.js';
import { navigate } from '../router.js';
import { setCount } from '../stats.js';
import { escapeHtml, renderEmpty, setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { MAX_WORKOUT_SETS, validateWorkout } from '../validation.js';

// Незаписаните промени във формата остават при смяна на езика (екранът се изчертава отново).
let draft = null;

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
    ? renderEmpty(t('dash.noWorkouts'), `<a class="btn" href="#/workouts/new">${t('wo.new')}</a>`)
    : `
      <ul class="list">
        ${workouts.map((workout) => `
          <li>
            <a class="list-item list-link" href="#/workouts/${workout.id}">
              <div class="list-item-main">
                <p class="list-item-title">${escapeHtml(workout.title)}</p>
                <p class="list-item-meta">${formatDate(workout.workout_date)} · ${tn('plural.sets', setCount(workout))} · ${formatNumber(workoutVolume(workout))} kg</p>
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
        <a class="btn" href="#/workouts/new">${t('wo.new')}</a>
      </div>
      <div class="card">${listHtml}</div>
    </section>
  `);
}

function notFound(message) {
  setView(`
    <section>
      <a class="back-link" href="#/workouts">${t('wo.back')}</a>
      ${renderEmpty(message)}
    </section>
  `);
}

async function renderWorkoutDetail(id, isCurrent) {
  const workout = await fetchWorkout(id);
  if (!isCurrent()) {
    return;
  }
  if (!workout) {
    notFound(t('wo.notFound'));
    return;
  }
  const groups = groupByExercise(workout.workout_items);

  const main = setView(`
    <section>
      <a class="back-link" href="#/workouts">${t('wo.back')}</a>
      <div class="page-head">
        <div>
          <h1>${escapeHtml(workout.title)}</h1>
          <p>${formatDate(workout.workout_date)}${workout.plan ? ` · ${t('wo.byPlan', { name: escapeHtml(workout.plan.name) })}` : ''} · ${t('wo.volume', { n: formatNumber(workoutVolume(workout)) })}</p>
        </div>
        <div class="item-actions">
          <a class="btn btn-ghost" href="#/workouts/${workout.id}/edit">${t('common.edit')}</a>
          <button class="btn btn-danger" type="button" data-delete-workout>${t('common.delete')}</button>
        </div>
      </div>
      ${workout.notes ? `<div class="card"><p>${escapeHtml(workout.notes)}</p></div>` : ''}
      ${groups.length === 0 ? renderEmpty(t('wo.noSets')) : ''}
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

  const deleteButton = main.querySelector('[data-delete-workout]');
  deleteButton.addEventListener('click', async () => {
    if (!window.confirm(t('wo.confirmDelete', { name: workout.title }))) {
      return;
    }
    setBusy(deleteButton, true, t('common.deleting'));
    try {
      await deleteWorkout(workout.id);
      showToast(t('wo.deleted'), 'success');
      navigate('workouts');
    } catch (error) {
      setBusy(deleteButton, false);
      showToast(translateError(error), 'error');
    }
  });
}

function setsFromPlan(plan) {
  return plan.plan_items
    .flatMap((item) =>
      Array.from({ length: item.target_sets }, () => ({
        exerciseId: item.exercise?.id ?? '',
        repetitions: item.target_reps ?? '',
        weightKg: item.target_weight_kg ?? '',
        durationMinutes: item.target_duration_minutes ?? ''
      }))
    )
    .slice(0, MAX_WORKOUT_SETS);
}

function setsFromWorkout(workout) {
  return workout.workout_items.map((item) => ({
    exerciseId: item.exercise?.id ?? '',
    repetitions: item.repetitions ?? '',
    weightKg: item.weight_kg ?? '',
    durationMinutes: item.duration_minutes ?? ''
  }));
}

function setRow(set, exercises) {
  const selectId = uid('set-exercise');
  return `
    <div class="row-editor-row" data-row>
      <span class="row-number" data-row-number aria-hidden="true"></span>
      <div class="field row-editor-wide">
        <label for="${selectId}">${t('wo.exercise')}</label>
        <select id="${selectId}" data-field="exerciseId">${exerciseOptions(exercises, set.exerciseId)}</select>
      </div>
      ${numberField({ field: 'repetitions', label: t('wo.reps'), value: set.repetitions })}
      ${numberField({ field: 'weightKg', label: t('wo.weight'), value: set.weightKg, step: '0.25' })}
      ${numberField({ field: 'durationMinutes', label: t('wo.minutes'), value: set.durationMinutes })}
      <button class="btn btn-ghost btn-small row-remove" type="button" data-remove-row>✕</button>
      <p class="field-error row-error" data-row-error></p>
    </div>`;
}

function readWorkoutForm(form, rows) {
  return {
    title: form.elements.title.value,
    workoutDate: form.elements.workoutDate.value,
    planId: form.elements.planId.value,
    notes: form.elements.notes.value,
    sets: readRows(rows)
  };
}

async function renderWorkoutForm({ workoutId, planId }, isCurrent) {
  const key = window.location.hash;
  const [exercises, plans, workout, plan] = await Promise.all([
    fetchExercises(),
    fetchPlans(),
    workoutId ? fetchWorkout(workoutId) : null,
    planId ? fetchPlan(planId) : null
  ]);
  if (!isCurrent()) {
    return;
  }
  if (workoutId && !workout) {
    notFound(t('wo.notFound'));
    return;
  }
  if (planId && !plan) {
    notFound(t('plans.notFound'));
    return;
  }

  let values;
  if (draft?.key === key) {
    values = draft.values;
  } else if (workout) {
    values = { title: workout.title, workoutDate: workout.workout_date, planId: workout.plan_id ?? '', notes: workout.notes ?? '', sets: setsFromWorkout(workout) };
  } else if (plan) {
    values = { title: plan.name, workoutDate: toIsoDate(new Date()), planId: plan.id, notes: '', sets: setsFromPlan(plan) };
  } else {
    values = { title: '', workoutDate: toIsoDate(new Date()), planId: '', notes: '', sets: [{}] };
  }
  draft = { key, values };

  const backHref = workout ? `#/workouts/${workout.id}` : plan ? '#/plans' : '#/workouts';
  const heading = workout ? t('wo.edit') : t('wo.new');

  const main = setView(`
    <section>
      <a class="back-link" href="${backHref}">${t('common.back')}</a>
      <div class="page-head">
        <div>
          <h1>${heading}</h1>
          <p>${plan ? t('wo.fromPlan', { name: escapeHtml(plan.name) }) : t('wo.formHint')}</p>
        </div>
      </div>
      ${exercises.length === 0 ? renderEmpty(t('wo.noExercises'), `<a class="btn" href="#/exercises">${t('nav.exercises')}</a>`) : ''}
      <form class="form card" id="workout-form" novalidate>
        <div class="alert" role="alert"></div>
        <div class="form-row">
          <div class="field">
            <label for="workout-title">${t('wo.title')}</label>
            <input id="workout-title" name="title" type="text" maxlength="80" required value="${escapeHtml(values.title)}">
            <p class="field-error" data-error-for="title"></p>
          </div>
          <div class="field">
            <label for="workout-date">${t('wo.date')}</label>
            <input id="workout-date" name="workoutDate" type="date" required value="${escapeHtml(values.workoutDate)}">
            <p class="field-error" data-error-for="workoutDate"></p>
          </div>
          <div class="field">
            <label for="workout-plan">${t('wo.plan')}</label>
            <select id="workout-plan" name="planId">
              <option value="">${t('wo.noPlan')}</option>
              ${plans.map((item) => `<option value="${item.id}"${item.id === values.planId ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="workout-notes">${t('wo.notes')}</label>
          <textarea id="workout-notes" name="notes" rows="2" maxlength="1000">${escapeHtml(values.notes)}</textarea>
          <p class="field-error" data-error-for="notes"></p>
        </div>

        <fieldset class="row-editor">
          <legend>${t('wo.sets')}</legend>
          <p class="field-hint">${t('wo.setsHint')}</p>
          <div id="set-rows">${values.sets.map((set) => setRow(set, exercises)).join('')}</div>
          <p class="field-error" data-error-for="sets"></p>
          <button class="btn btn-ghost btn-small" type="button" data-add-row>${t('wo.addSet')}</button>
        </fieldset>

        <p class="stat-note" id="workout-volume" aria-live="polite"></p>

        <div class="form-actions">
          <button class="btn" type="submit">${workout ? t('common.saveChanges') : t('wo.save')}</button>
          <a class="btn btn-ghost" href="${backHref}" data-cancel>${t('common.cancel')}</a>
        </div>
      </form>
    </section>
  `);

  const form = main.querySelector('#workout-form');
  const rows = main.querySelector('#set-rows');
  const volume = main.querySelector('#workout-volume');

  function refresh() {
    renumberRows(rows, 'wo.removeSet');
    const current = readWorkoutForm(form, rows);
    draft = { key, values: current };
    const items = current.sets.map((set) => ({ repetitions: set.repetitions, weight_kg: set.weightKg }));
    volume.textContent = t('wo.volume', { n: formatNumber(workoutVolume({ workout_items: items })) });
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  main.querySelector('[data-add-row]').addEventListener('click', () => {
    if (rows.querySelectorAll('[data-row]').length >= MAX_WORKOUT_SETS) {
      showToast(t('val.setsTooMany', { n: MAX_WORKOUT_SETS }), 'error');
      return;
    }
    // Новата серия копира предишната, за да не се въвежда същото упражнение отново.
    const previous = readRows(rows).at(-1) ?? {};
    rows.insertAdjacentHTML('beforeend', setRow(previous, exercises));
    refresh();
    rows.querySelector('[data-row]:last-child [data-field="repetitions"]')?.focus();
  });

  rows.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-row]');
    if (!remove) {
      return;
    }
    remove.closest('[data-row]').remove();
    refresh();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const current = readWorkoutForm(form, rows);
    const { valid, errors, setErrors } = validateWorkout(current);
    setFormAlert(form, '');
    showFieldErrors(form, errors);
    const firstRowError = showRowErrors(rows, setErrors);
    if (!valid) {
      if (Object.keys(errors).length === 0) {
        firstRowError?.focus();
      }
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, t('common.saving'));
    try {
      const saved = workout ? await updateWorkout(workout.id, current, workout.workout_items.map((item) => item.id)) : await createWorkout(current);
      draft = null;
      showToast(workout ? t('wo.updated') : t('wo.created'), 'success');
      navigate('workouts', saved.id);
    } catch (error) {
      setBusy(button, false);
      setFormAlert(form, translateError(error));
    }
  });

  refresh();
}

export async function renderWorkouts({ params, isCurrent }) {
  const [first, second] = params;
  if (first === 'new') {
    await renderWorkoutForm({ planId: second }, isCurrent);
    return;
  }
  if (first && second === 'edit') {
    await renderWorkoutForm({ workoutId: first }, isCurrent);
    return;
  }
  draft = null;
  if (first) {
    await renderWorkoutDetail(first, isCurrent);
    return;
  }
  await renderWorkoutList(isCurrent);
}

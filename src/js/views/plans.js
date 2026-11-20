import { createPlan, deletePlan, fetchExercises, fetchPlan, fetchPlans, updatePlan } from '../api.js';
import { translateError } from '../errors.js';
import { exerciseOptions, numberField, readRows, renumberRows, showRowErrors, uid } from '../formRows.js';
import { formatNumber } from '../format.js';
import { t, tn } from '../i18n.js';
import { navigate } from '../router.js';
import { escapeHtml, renderEmpty, setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { MAX_PLAN_ITEMS, validatePlan } from '../validation.js';

// Незаписаните промени остават при смяна на езика.
let draft = null;

function describeTarget(item) {
  const parts = [`${item.target_sets} ×`];
  if (item.target_reps !== null) {
    parts.push(t('unit.reps', { n: item.target_reps }));
  }
  if (item.target_duration_minutes !== null) {
    parts.push(t('unit.minutes', { n: item.target_duration_minutes }));
  }
  if (item.target_weight_kg !== null) {
    parts.push(`@ ${formatNumber(item.target_weight_kg)} kg`);
  }
  return parts.join(' ');
}

async function renderPlanList(isCurrent) {
  const plans = await fetchPlans();
  if (!isCurrent()) {
    return;
  }

  const content = plans.length === 0
    ? renderEmpty(t('plans.empty'), `<a class="btn" href="#/plans/new">${t('plans.new')}</a>`)
    : `
      <div class="grid grid-two">
        ${plans.map((plan) => `
          <article class="card">
            <div class="card-head">
              <h2>${escapeHtml(plan.name)}</h2>
              <span class="badge badge-primary">${tn('plural.exercises', plan.plan_items.length)}</span>
            </div>
            ${plan.description ? `<p>${escapeHtml(plan.description)}</p>` : ''}
            ${plan.plan_items.length === 0
              ? `<p class="empty">${t('plans.noItems')}</p>`
              : `<ol class="plan-items">
                  ${plan.plan_items.map((item) => `
                    <li><strong>${escapeHtml(item.exercise?.name ?? '—')}</strong> — ${describeTarget(item)}</li>`).join('')}
                </ol>`}
            <div class="item-actions card-actions">
              ${plan.plan_items.length > 0 ? `<a class="btn btn-small" href="#/workouts/new/${plan.id}">${t('plans.start')}</a>` : ''}
              <a class="btn btn-ghost btn-small" href="#/plans/${plan.id}/edit">${t('common.edit')}</a>
              <button class="btn btn-danger btn-small" type="button" data-delete="${plan.id}" data-name="${escapeHtml(plan.name)}">${t('common.delete')}</button>
            </div>
          </article>`).join('')}
      </div>`;

  const main = setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.plans')}</h1>
          <p>${t('plans.subtitle')}</p>
        </div>
        <a class="btn" href="#/plans/new">${t('plans.new')}</a>
      </div>
      ${content}
    </section>
  `);

  const section = main.querySelector('section');
  section.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete]');
    if (!button || !window.confirm(t('plans.confirmDelete', { name: button.dataset.name }))) {
      return;
    }
    setBusy(button, true, t('common.deleting'));
    try {
      await deletePlan(button.dataset.delete);
      showToast(t('plans.deleted'), 'success');
      button.closest('article').remove();
      if (!section.querySelector('article')) {
        await renderPlanList(isCurrent);
      }
    } catch (error) {
      setBusy(button, false);
      showToast(translateError(error), 'error');
    }
  });
}

function itemRow(item, exercises) {
  const selectId = uid('plan-exercise');
  return `
    <div class="row-editor-row" data-row>
      <span class="row-number" data-row-number aria-hidden="true"></span>
      <div class="field row-editor-wide">
        <label for="${selectId}">${t('wo.exercise')}</label>
        <select id="${selectId}" data-field="exerciseId">${exerciseOptions(exercises, item.exerciseId)}</select>
      </div>
      ${numberField({ field: 'targetSets', label: t('plans.targetSets'), value: item.targetSets ?? 3, min: '1' })}
      ${numberField({ field: 'targetReps', label: t('wo.reps'), value: item.targetReps, min: '1' })}
      ${numberField({ field: 'targetWeightKg', label: t('wo.weight'), value: item.targetWeightKg, step: '0.25' })}
      ${numberField({ field: 'targetDurationMinutes', label: t('wo.minutes'), value: item.targetDurationMinutes, min: '1' })}
      <button class="btn btn-ghost btn-small row-remove" type="button" data-remove-row>✕</button>
      <p class="field-error row-error" data-row-error></p>
    </div>`;
}

function itemsFromPlan(plan) {
  return plan.plan_items.map((item) => ({
    exerciseId: item.exercise?.id ?? '',
    targetSets: item.target_sets,
    targetReps: item.target_reps ?? '',
    targetWeightKg: item.target_weight_kg ?? '',
    targetDurationMinutes: item.target_duration_minutes ?? ''
  }));
}

function readPlanForm(form, rows) {
  return {
    name: form.elements.name.value,
    description: form.elements.description.value,
    items: readRows(rows)
  };
}

async function renderPlanForm(planId, isCurrent) {
  const key = window.location.hash;
  const [exercises, plan] = await Promise.all([fetchExercises(), planId ? fetchPlan(planId) : null]);
  if (!isCurrent()) {
    return;
  }
  if (planId && !plan) {
    setView(`
      <section>
        <a class="back-link" href="#/plans">${t('common.back')}</a>
        ${renderEmpty(t('plans.notFound'))}
      </section>
    `);
    return;
  }

  let values;
  if (draft?.key === key) {
    values = draft.values;
  } else if (plan) {
    values = { name: plan.name, description: plan.description ?? '', items: itemsFromPlan(plan) };
  } else {
    values = { name: '', description: '', items: [{}] };
  }
  draft = { key, values };

  const main = setView(`
    <section>
      <a class="back-link" href="#/plans">${t('common.back')}</a>
      <div class="page-head">
        <div>
          <h1>${plan ? t('plans.edit') : t('plans.new')}</h1>
          <p>${t('plans.formHint')}</p>
        </div>
      </div>
      <form class="form card" id="plan-form" novalidate>
        <div class="alert" role="alert"></div>
        <div class="field">
          <label for="plan-name">${t('plans.name')}</label>
          <input id="plan-name" name="name" type="text" maxlength="60" required value="${escapeHtml(values.name)}">
          <p class="field-error" data-error-for="name"></p>
        </div>
        <div class="field">
          <label for="plan-description">${t('plans.description')}</label>
          <textarea id="plan-description" name="description" rows="2" maxlength="500">${escapeHtml(values.description)}</textarea>
          <p class="field-error" data-error-for="description"></p>
        </div>

        <fieldset class="row-editor">
          <legend>${t('nav.exercises')}</legend>
          <p class="field-hint">${t('plans.itemsHint')}</p>
          <div id="plan-rows">${values.items.map((item) => itemRow(item, exercises)).join('')}</div>
          <p class="field-error" data-error-for="items"></p>
          <button class="btn btn-ghost btn-small" type="button" data-add-row>${t('plans.addItem')}</button>
        </fieldset>

        <div class="form-actions">
          <button class="btn" type="submit">${plan ? t('common.saveChanges') : t('plans.save')}</button>
          <a class="btn btn-ghost" href="#/plans">${t('common.cancel')}</a>
        </div>
      </form>
    </section>
  `);

  const form = main.querySelector('#plan-form');
  const rows = main.querySelector('#plan-rows');

  function refresh() {
    renumberRows(rows, 'plans.removeItem');
    draft = { key, values: readPlanForm(form, rows) };
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  main.querySelector('[data-add-row]').addEventListener('click', () => {
    if (rows.querySelectorAll('[data-row]').length >= MAX_PLAN_ITEMS) {
      showToast(t('val.itemsTooMany', { n: MAX_PLAN_ITEMS }), 'error');
      return;
    }
    rows.insertAdjacentHTML('beforeend', itemRow({}, exercises));
    refresh();
    rows.querySelector('[data-row]:last-child select')?.focus();
  });

  rows.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-row]');
    if (remove) {
      remove.closest('[data-row]').remove();
      refresh();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const current = readPlanForm(form, rows);
    const { valid, errors, itemErrors } = validatePlan(current);
    setFormAlert(form, '');
    showFieldErrors(form, errors);
    const firstRowError = showRowErrors(rows, itemErrors);
    if (!valid) {
      if (Object.keys(errors).length === 0) {
        firstRowError?.focus();
      }
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, t('common.saving'));
    try {
      if (plan) {
        await updatePlan(plan.id, current, plan.plan_items.map((item) => item.id));
      } else {
        await createPlan(current);
      }
      draft = null;
      showToast(plan ? t('plans.updated') : t('plans.created'), 'success');
      navigate('plans');
    } catch (error) {
      setBusy(button, false);
      setFormAlert(form, translateError(error));
    }
  });

  refresh();
}

export async function renderPlans({ params, isCurrent }) {
  const [first, second] = params;
  if (first === 'new') {
    await renderPlanForm(null, isCurrent);
    return;
  }
  if (first && second === 'edit') {
    await renderPlanForm(first, isCurrent);
    return;
  }
  draft = null;
  await renderPlanList(isCurrent);
}

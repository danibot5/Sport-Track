import { createExercise, deleteExercise, fetchExercises } from '../api.js';
import { getUser } from '../auth.js';
import { translateError } from '../errors.js';
import { CATEGORIES } from '../format.js';
import { getLocale, t } from '../i18n.js';
import { escapeHtml, setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateExercise } from '../validation.js';

const FILTERS = ['all', 'mine', ...CATEGORIES];

let filter = 'all';

function filterLabel(id) {
  if (id === 'all') {
    return t('common.all');
  }
  if (id === 'mine') {
    return t('ex.mine');
  }
  return t(`category.${id}`);
}

function applyFilter(exercises) {
  if (filter === 'all') {
    return exercises;
  }
  if (filter === 'mine') {
    return exercises.filter((exercise) => exercise.user_id);
  }
  return exercises.filter((exercise) => exercise.category === filter);
}

function renderList(exercises) {
  if (exercises.length === 0) {
    return `<p class="empty">${t('ex.empty')}</p>`;
  }
  const userId = getUser().id;
  return `
    <ul class="list">
      ${exercises.map((exercise) => `
        <li class="list-item">
          <div class="list-item-main">
            <p class="list-item-title">${escapeHtml(exercise.name)}</p>
            <p class="list-item-meta">
              ${t(`category.${exercise.category}`)} · ${exercise.uses_weight ? t('ex.withWeight') : t('ex.noWeight')}
            </p>
          </div>
          ${exercise.user_id === userId
            ? `<button class="btn btn-danger btn-small" type="button" data-delete="${exercise.id}" data-name="${escapeHtml(exercise.name)}">${t('common.delete')}</button>`
            : `<span class="badge">${t('ex.shared')}</span>`}
        </li>`).join('')}
    </ul>`;
}

export async function renderExercises({ isCurrent }) {
  let exercises = await fetchExercises();
  if (!isCurrent()) {
    return;
  }

  const main = setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.exercises')}</h1>
          <p>${t('ex.subtitle')}</p>
        </div>
      </div>

      <div class="grid grid-two">
        <div class="card">
          <div class="card-head"><h2>${t('ex.new')}</h2></div>
          <form class="form" id="exercise-form" novalidate>
            <div class="alert" role="alert"></div>
            <div class="field">
              <label for="exercise-name">${t('ex.name')}</label>
              <input id="exercise-name" name="name" type="text" maxlength="60" required>
              <p class="field-error" data-error-for="name"></p>
            </div>
            <div class="field">
              <label for="exercise-category">${t('ex.category')}</label>
              <select id="exercise-category" name="category" required>
                ${CATEGORIES.map((id) => `<option value="${id}">${t(`category.${id}`)}</option>`).join('')}
              </select>
              <p class="field-error" data-error-for="category"></p>
            </div>
            <label class="checkbox">
              <input name="usesWeight" type="checkbox" checked>
              ${t('ex.usesWeight')}
            </label>
            <button class="btn" type="submit">${t('ex.add')}</button>
          </form>
        </div>

        <div class="card">
          <div class="card-head">
            <h2>${t('ex.library')}</h2>
            <span class="badge" id="exercise-count"></span>
          </div>
          <div class="filters" role="group" aria-label="${t('ex.filterLabel')}">
            ${FILTERS.map((id) => `<button class="chip" type="button" data-filter="${id}" aria-pressed="${id === filter}">${filterLabel(id)}</button>`).join('')}
          </div>
          <div id="exercise-list"></div>
        </div>
      </div>
    </section>
  `);

  const listContainer = main.querySelector('#exercise-list');
  const countBadge = main.querySelector('#exercise-count');
  const form = main.querySelector('#exercise-form');

  function refreshList() {
    const visible = applyFilter(exercises);
    listContainer.innerHTML = renderList(visible);
    countBadge.textContent = t('ex.count', { n: visible.length });
  }

  main.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      main.querySelectorAll('[data-filter]').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === chip));
      });
      refreshList();
    });
  });

  listContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete]');
    if (!button) {
      return;
    }
    if (!window.confirm(t('ex.confirmDelete', { name: button.dataset.name }))) {
      return;
    }
    setBusy(button, true, t('common.deleting'));
    try {
      await deleteExercise(button.dataset.delete);
      exercises = exercises.filter((exercise) => exercise.id !== button.dataset.delete);
      refreshList();
      showToast(t('ex.deleted'), 'success');
    } catch (error) {
      setBusy(button, false);
      showToast(translateError(error), 'error');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = {
      name: form.elements.name.value,
      category: form.elements.category.value,
      usesWeight: form.elements.usesWeight.checked
    };
    const { valid, errors } = validateExercise(values);
    showFieldErrors(form, errors);
    setFormAlert(form, '');
    if (!valid) {
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, t('common.saving'));
    try {
      const created = await createExercise(values);
      exercises = [...exercises, created].sort((a, b) => a.name.localeCompare(b.name, getLocale()));
      form.reset();
      refreshList();
      showToast(t('ex.added'), 'success');
    } catch (error) {
      setFormAlert(form, translateError(error));
    } finally {
      setBusy(button, false);
    }
  });

  refreshList();
}

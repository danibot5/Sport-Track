import { createExercise, deleteExercise, fetchExercises } from '../api.js';
import { getUser } from '../auth.js';
import { translateError } from '../errors.js';
import { CATEGORY_LABELS } from '../format.js';
import { escapeHtml, setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateExercise } from '../validation.js';

const FILTERS = [
  { id: 'all', label: 'Всички' },
  { id: 'mine', label: 'Мои' },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }))
];

function applyFilter(exercises, filter) {
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
    return '<p class="empty">Няма упражнения в тази категория.</p>';
  }
  const userId = getUser().id;
  return `
    <ul class="list">
      ${exercises.map((exercise) => `
        <li class="list-item">
          <div class="list-item-main">
            <p class="list-item-title">${escapeHtml(exercise.name)}</p>
            <p class="list-item-meta">
              ${CATEGORY_LABELS[exercise.category]} · ${exercise.uses_weight ? 'с тежест' : 'без тежест'}
            </p>
          </div>
          ${exercise.user_id === userId
            ? `<button class="btn btn-danger btn-small" type="button" data-delete="${exercise.id}" data-name="${escapeHtml(exercise.name)}">Изтрий</button>`
            : '<span class="badge">Общо</span>'}
        </li>`).join('')}
    </ul>`;
}

export async function renderExercises({ isCurrent }) {
  let exercises = await fetchExercises();
  if (!isCurrent()) {
    return;
  }
  let filter = 'all';

  const main = setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>Упражнения</h1>
          <p>Общата библиотека и вашите собствени упражнения.</p>
        </div>
      </div>

      <div class="grid grid-two">
        <div class="card">
          <div class="card-head"><h2>Ново упражнение</h2></div>
          <form class="form" id="exercise-form" novalidate>
            <div class="alert" role="alert"></div>
            <div class="field">
              <label for="exercise-name">Име</label>
              <input id="exercise-name" name="name" type="text" maxlength="60" required>
              <p class="field-error" data-error-for="name"></p>
            </div>
            <div class="field">
              <label for="exercise-category">Категория</label>
              <select id="exercise-category" name="category" required>
                ${Object.entries(CATEGORY_LABELS).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
              </select>
              <p class="field-error" data-error-for="category"></p>
            </div>
            <label class="checkbox">
              <input name="usesWeight" type="checkbox" checked>
              Изпълнява се с тежест (kg)
            </label>
            <button class="btn" type="submit">Добави упражнение</button>
          </form>
        </div>

        <div class="card">
          <div class="card-head">
            <h2>Библиотека</h2>
            <span class="badge" id="exercise-count"></span>
          </div>
          <div class="filters" role="group" aria-label="Филтър по категория">
            ${FILTERS.map((item) => `<button class="chip" type="button" data-filter="${item.id}" aria-pressed="${item.id === filter}">${item.label}</button>`).join('')}
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
    const visible = applyFilter(exercises, filter);
    listContainer.innerHTML = renderList(visible);
    countBadge.textContent = `${visible.length} бр.`;
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
    if (!window.confirm(`Да изтрия ли „${button.dataset.name}“?`)) {
      return;
    }
    setBusy(button, true, 'Изтриване…');
    try {
      await deleteExercise(button.dataset.delete);
      exercises = exercises.filter((exercise) => exercise.id !== button.dataset.delete);
      refreshList();
      showToast('Упражнението е изтрито.', 'success');
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
    setBusy(button, true, 'Запазване…');
    try {
      const created = await createExercise(values);
      exercises = [...exercises, created].sort((a, b) => a.name.localeCompare(b.name, 'bg'));
      form.reset();
      refreshList();
      showToast('Упражнението е добавено.', 'success');
    } catch (error) {
      setFormAlert(form, translateError(error));
    } finally {
      setBusy(button, false);
    }
  });

  refreshList();
}

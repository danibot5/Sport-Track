import { t } from './i18n.js';
import { escapeHtml } from './ui.js';

let nextId = 0;

export function uid(prefix) {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export function exerciseOptions(exercises, selectedId) {
  const options = exercises.map(
    (exercise) => `<option value="${exercise.id}"${exercise.id === selectedId ? ' selected' : ''}>${escapeHtml(exercise.name)}</option>`
  );
  return `<option value="">${t('form.chooseExercise')}</option>${options.join('')}`;
}

export function numberField({ field, label, value, step = '1', min = '0' }) {
  const id = uid(field);
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" type="number" inputmode="decimal" step="${step}" min="${min}" data-field="${field}" value="${escapeHtml(value ?? '')}">
    </div>`;
}

export function readRows(container) {
  return [...container.querySelectorAll('[data-row]')].map((row) => {
    const values = {};
    row.querySelectorAll('[data-field]').forEach((input) => {
      values[input.dataset.field] = input.value.trim();
    });
    return values;
  });
}

export function renumberRows(container, labelKey) {
  container.querySelectorAll('[data-row]').forEach((row, index) => {
    const number = row.querySelector('[data-row-number]');
    if (number) {
      number.textContent = String(index + 1);
    }
    const remove = row.querySelector('[data-remove-row]');
    if (remove) {
      remove.setAttribute('aria-label', t(labelKey, { n: index + 1 }));
    }
  });
}

export function showRowErrors(container, rowErrors) {
  let firstInvalid = null;
  container.querySelectorAll('[data-row]').forEach((row, index) => {
    const errors = rowErrors[index] ?? {};
    row.querySelectorAll('[data-field]').forEach((input) => {
      const invalid = Boolean(errors[input.dataset.field]);
      input.setAttribute('aria-invalid', String(invalid));
      if (invalid && !firstInvalid) {
        firstInvalid = input;
      }
    });
    const message = row.querySelector('[data-row-error]');
    if (message) {
      message.textContent = [...new Set(Object.values(errors))].join(' ');
    }
  });
  return firstInvalid;
}

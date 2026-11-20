import { t } from './i18n.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function setView(html) {
  const main = document.getElementById('main');
  main.innerHTML = html;
  return main;
}

export function langToggle() {
  return `<button class="btn btn-ghost btn-small lang-toggle" type="button" data-lang-toggle aria-label="${t('lang.switchLabel')}">${t('lang.switch')}</button>`;
}

export function showLoading() {
  setView(`<div class="loader" role="status">${t('common.loading')}</div>`);
}

export function showToast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), 4000);
}

export function showFieldErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach((node) => {
    const field = node.dataset.errorFor;
    node.textContent = errors[field] ?? '';
    const input = form.elements[field];
    if (input) {
      input.setAttribute('aria-invalid', errors[field] ? 'true' : 'false');
    }
  });
  const firstInvalid = Object.keys(errors).map((name) => form.elements[name]).find(Boolean);
  if (firstInvalid) {
    firstInvalid.focus();
  }
}

export function setFormAlert(form, message, type = 'error') {
  const alert = form.querySelector('.alert');
  if (!alert) {
    return;
  }
  alert.className = `alert alert-${type}`;
  alert.textContent = message ?? '';
}

export function setBusy(button, busy, busyText = t('common.wait')) {
  if (busy) {
    button.dataset.label = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label ?? button.textContent;
    button.disabled = false;
  }
}

export function renderError(message) {
  return `<div class="alert alert-error" role="alert">${escapeHtml(message)}</div>`;
}

export function renderEmpty(message, actionHtml = '') {
  return `<div class="empty-state"><p class="empty">${escapeHtml(message)}</p>${actionHtml}</div>`;
}

export function renderErrorPage(message) {
  return `
    <section class="error-page">
      <div class="card">
        <h1>${t('err.pageTitle')}</h1>
        ${renderError(message)}
        <div class="form-actions">
          <button class="btn" type="button" data-retry>${t('common.retry')}</button>
          <a class="btn btn-ghost" href="#/dashboard">${t('nav.dashboard')}</a>
        </div>
      </div>
    </section>`;
}

import { fetchPlans } from '../api.js';
import { formatNumber } from '../format.js';
import { t, tn } from '../i18n.js';
import { escapeHtml, setView } from '../ui.js';

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

export async function renderPlans({ isCurrent }) {
  const plans = await fetchPlans();
  if (!isCurrent()) {
    return;
  }

  const content = plans.length === 0
    ? `<p class="empty">${t('plans.empty')}</p>`
    : `
      <div class="grid grid-two">
        ${plans.map((plan) => `
          <article class="card">
            <div class="card-head">
              <h2>${escapeHtml(plan.name)}</h2>
              <span class="badge badge-primary">${tn('plural.exercises', plan.plan_items.length)}</span>
            </div>
            ${plan.description ? `<p>${escapeHtml(plan.description)}</p>` : ''}
            <ol class="plan-items">
              ${plan.plan_items.map((item) => `
                <li><strong>${escapeHtml(item.exercise?.name ?? '—')}</strong> — ${describeTarget(item)}</li>`).join('')}
            </ol>
          </article>`).join('')}
      </div>`;

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.plans')}</h1>
          <p>${t('plans.subtitle')}</p>
        </div>
      </div>
      ${content}
    </section>
  `);
}

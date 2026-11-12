import { fetchPlans } from '../api.js';
import { formatNumber, pluralize } from '../format.js';
import { escapeHtml, setView } from '../ui.js';

function describeTarget(item) {
  const parts = [`${item.target_sets} ×`];
  if (item.target_reps !== null) {
    parts.push(`${item.target_reps} повт.`);
  }
  if (item.target_duration_minutes !== null) {
    parts.push(`${item.target_duration_minutes} мин`);
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
    ? '<p class="empty">Все още нямате тренировъчни планове.</p>'
    : `
      <div class="grid grid-two">
        ${plans.map((plan) => `
          <article class="card">
            <div class="card-head">
              <h2>${escapeHtml(plan.name)}</h2>
              <span class="badge badge-primary">${pluralize(plan.plan_items.length, 'упражнение', 'упражнения')}</span>
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
          <h1>Планове</h1>
          <p>Тренировъчни планове с целеви серии и повторения.</p>
        </div>
      </div>
      ${content}
    </section>
  `);
}

import { fetchGoals, fetchWorkouts } from '../api.js';
import { formatDate, formatNumber } from '../format.js';
import { t } from '../i18n.js';
import { goalProgress, workoutsInWeek } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';

function renderGoal(goal, workoutsThisWeek) {
  const progress = goalProgress(goal, workoutsThisWeek);
  const target = `${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)}`;
  return `
    <li class="list-item">
      <div class="list-item-main" style="flex: 1">
        <p class="list-item-title">${escapeHtml(goal.title)}</p>
        <p class="list-item-meta">
          ${t(`goalType.${goal.goal_type}`)} · ${t('dash.target', { value: target })} · ${t('dash.due', { date: formatDate(goal.due_date) })}
        </p>
        ${progress === null ? '' : `
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="${t('dash.goalProgress')}">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>`}
      </div>
      ${goal.completed
        ? `<span class="badge badge-success">${t('goals.completed')}</span>`
        : `<span class="badge badge-primary">${t('goals.active')}</span>`}
    </li>`;
}

export async function renderGoals({ isCurrent }) {
  const [goals, workouts] = await Promise.all([fetchGoals(), fetchWorkouts()]);
  if (!isCurrent()) {
    return;
  }
  const workoutsThisWeek = workoutsInWeek(workouts).length;

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.goals')}</h1>
          <p>${t('goals.subtitle')}</p>
        </div>
      </div>
      <div class="card">
        ${goals.length === 0
          ? `<p class="empty">${t('goals.empty')}</p>`
          : `<ul class="list">${goals.map((goal) => renderGoal(goal, workoutsThisWeek)).join('')}</ul>`}
      </div>
    </section>
  `);
}

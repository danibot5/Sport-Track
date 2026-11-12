import { fetchGoals, fetchWorkouts } from '../api.js';
import { formatDate, formatNumber, GOAL_TYPE_LABELS } from '../format.js';
import { goalProgress, workoutsInWeek } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';

function renderGoal(goal, workoutsThisWeek) {
  const progress = goalProgress(goal, workoutsThisWeek);
  return `
    <li class="list-item">
      <div class="list-item-main" style="flex: 1">
        <p class="list-item-title">${escapeHtml(goal.title)}</p>
        <p class="list-item-meta">
          ${GOAL_TYPE_LABELS[goal.goal_type]} · цел ${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)} · срок ${formatDate(goal.due_date)}
        </p>
        ${progress === null ? '' : `
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="Напредък">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>`}
      </div>
      ${goal.completed ? '<span class="badge badge-success">Изпълнена</span>' : '<span class="badge badge-primary">Активна</span>'}
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
          <h1>Цели</h1>
          <p>Лични цели за постоянство и напредък.</p>
        </div>
      </div>
      <div class="card">
        ${goals.length === 0
          ? '<p class="empty">Все още нямате поставени цели.</p>'
          : `<ul class="list">${goals.map((goal) => renderGoal(goal, workoutsThisWeek)).join('')}</ul>`}
      </div>
    </section>
  `);
}

import { fetchGoals, fetchWorkouts } from '../api.js';
import { getDisplayName } from '../auth.js';
import { formatDate, formatNumber, GOAL_TYPE_LABELS, pluralize } from '../format.js';
import { goalProgress, setCount, weeklyWorkoutCounts, workoutsInWeek } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';
import { renderWeekBars } from './progress.js';

function renderGoalCard(goal, workoutsThisWeek) {
  if (!goal) {
    return `
      <div class="card">
        <div class="card-head"><h2>Активна цел</h2></div>
        <p class="empty">Нямате активна цел. <a href="#/goals">Вижте целите</a>.</p>
      </div>`;
  }
  const progress = goalProgress(goal, workoutsThisWeek);
  const progressHtml = progress === null
    ? `<p class="stat-note">Цел: ${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)}</p>`
    : `
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="Напредък към целта">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <p class="stat-note">${workoutsThisWeek} от ${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)} тази седмица (${progress}%)</p>`;
  return `
    <div class="card">
      <div class="card-head">
        <h2>Активна цел</h2>
        <span class="badge badge-primary">${GOAL_TYPE_LABELS[goal.goal_type]}</span>
      </div>
      <p class="list-item-title">${escapeHtml(goal.title)}</p>
      ${progressHtml}
      <p class="stat-note">Срок: ${formatDate(goal.due_date)}</p>
    </div>`;
}

function renderRecentWorkouts(workouts) {
  if (workouts.length === 0) {
    return '<p class="empty">Все още нямате записани тренировки.</p>';
  }
  return `
    <ul class="list">
      ${workouts.map((workout) => `
        <li>
          <a class="list-item list-link" href="#/workouts/${workout.id}">
            <div class="list-item-main">
              <p class="list-item-title">${escapeHtml(workout.title)}</p>
              <p class="list-item-meta">${formatDate(workout.workout_date)} · ${pluralize(setCount(workout), 'серия', 'серии')}</p>
            </div>
            ${workout.plan ? `<span class="badge">${escapeHtml(workout.plan.name)}</span>` : ''}
          </a>
        </li>`).join('')}
    </ul>`;
}

export async function renderDashboard({ isCurrent }) {
  const [workouts, goals] = await Promise.all([fetchWorkouts(), fetchGoals()]);
  if (!isCurrent()) {
    return;
  }

  const thisWeek = workoutsInWeek(workouts);
  const setsThisWeek = thisWeek.reduce((sum, workout) => sum + setCount(workout), 0);
  const activeGoals = goals.filter((goal) => !goal.completed);
  const mainGoal = activeGoals.find((goal) => goal.goal_type === 'workouts_per_week') ?? activeGoals[0];
  const weeks = weeklyWorkoutCounts(workouts, 4);

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>Здравей, ${escapeHtml(getDisplayName())}!</h1>
          <p>Ето обобщение на тренировките ти.</p>
        </div>
        <a class="btn" href="#/workouts">Тренировки</a>
      </div>

      <div class="grid grid-stats">
        <div class="card">
          <p class="stat-label">Тренировки тази седмица</p>
          <p class="stat-value">${thisWeek.length}</p>
        </div>
        <div class="card">
          <p class="stat-label">Серии тази седмица</p>
          <p class="stat-value">${setsThisWeek}</p>
        </div>
        <div class="card">
          <p class="stat-label">Общо тренировки</p>
          <p class="stat-value">${workouts.length}</p>
        </div>
        <div class="card">
          <p class="stat-label">Активни цели</p>
          <p class="stat-value">${activeGoals.length}</p>
        </div>
      </div>

      <div class="grid grid-two" style="margin-top: 1rem">
        ${renderGoalCard(mainGoal, thisWeek.length)}
        <div class="card">
          <div class="card-head">
            <h2>Последни 4 седмици</h2>
            <a href="#/progress">Прогрес</a>
          </div>
          ${renderWeekBars(weeks)}
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <div class="card-head">
          <h2>Последни тренировки</h2>
          <a href="#/workouts">Всички</a>
        </div>
        ${renderRecentWorkouts(workouts.slice(0, 5))}
      </div>
    </section>
  `);
}

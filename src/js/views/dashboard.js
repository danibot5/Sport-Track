import { fetchGoals, fetchWorkouts } from '../api.js';
import { getDisplayName } from '../auth.js';
import { formatDate, formatNumber } from '../format.js';
import { goalProgress, setCount, weeklyWorkoutCounts, workoutsInWeek } from '../stats.js';
import { escapeHtml, setView } from '../ui.js';
import { renderWeekBars } from './progress.js';

function renderGoalCard(goal, workoutsThisWeek) {
  if (!goal) {
    return `
      <div class="card">
        <div class="card-head"><h2 data-i18n="dash.activeGoal"></h2></div>
        <p class="empty"><span data-i18n="dash.noGoal"></span> <a href="#/goals" data-i18n="dash.seeGoals"></a>.</p>
      </div>`;
  }
  const progress = goalProgress(goal, workoutsThisWeek);
  const progressHtml = progress === null
    ? `<p class="stat-note"><span data-i18n="dash.target"></span>: ${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)}</p>`
    : `
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" data-i18n-label="dash.goalProgress">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <p class="stat-note">${workoutsThisWeek} / ${formatNumber(goal.target_value)} ${escapeHtml(goal.unit)} <span data-i18n="dash.thisWeek"></span> (${progress}%)</p>`;
  return `
    <div class="card">
      <div class="card-head">
        <h2 data-i18n="dash.activeGoal"></h2>
        <span class="badge badge-primary" data-i18n="goalType.${goal.goal_type}"></span>
      </div>
      <p class="list-item-title">${escapeHtml(goal.title)}</p>
      ${progressHtml}
      <p class="stat-note"><span data-i18n="dash.due"></span>: ${formatDate(goal.due_date)}</p>
    </div>`;
}

function renderRecentWorkouts(workouts) {
  if (workouts.length === 0) {
    return '<p class="empty" data-i18n="dash.noWorkouts"></p>';
  }
  return `
    <ul class="list">
      ${workouts.map((workout) => `
        <li>
          <a class="list-item list-link" href="#/workouts/${workout.id}">
            <div class="list-item-main">
              <p class="list-item-title">${escapeHtml(workout.title)}</p>
              <p class="list-item-meta">${formatDate(workout.workout_date)} · <span data-i18n="dash.sets"></span>: ${setCount(workout)}</p>
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
          <h1><span data-i18n="dash.hello"></span>, ${escapeHtml(getDisplayName())}!</h1>
          <p data-i18n="dash.summary"></p>
        </div>
        <a class="btn" href="#/workouts" data-i18n="nav.workouts"></a>
      </div>

      <div class="grid grid-stats">
        <div class="card">
          <p class="stat-label" data-i18n="dash.workoutsWeek"></p>
          <p class="stat-value">${thisWeek.length}</p>
        </div>
        <div class="card">
          <p class="stat-label" data-i18n="dash.setsWeek"></p>
          <p class="stat-value">${setsThisWeek}</p>
        </div>
        <div class="card">
          <p class="stat-label" data-i18n="dash.totalWorkouts"></p>
          <p class="stat-value">${workouts.length}</p>
        </div>
        <div class="card">
          <p class="stat-label" data-i18n="dash.activeGoals"></p>
          <p class="stat-value">${activeGoals.length}</p>
        </div>
      </div>

      <div class="grid grid-two" style="margin-top: 1rem">
        ${renderGoalCard(mainGoal, thisWeek.length)}
        <div class="card">
          <div class="card-head">
            <h2 data-i18n="dash.last4"></h2>
            <a href="#/progress" data-i18n="nav.progress"></a>
          </div>
          ${renderWeekBars(weeks)}
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <div class="card-head">
          <h2 data-i18n="dash.recent"></h2>
          <a href="#/workouts" data-i18n="dash.all"></a>
        </div>
        ${renderRecentWorkouts(workouts.slice(0, 5))}
      </div>
    </section>
  `);
}

import { fetchWorkouts } from '../api.js';
import { formatDate, formatShortDate } from '../format.js';
import { t } from '../i18n.js';
import { weeklyWorkoutCounts } from '../stats.js';
import { setView } from '../ui.js';

export function renderWeekBars(weeks) {
  const max = Math.max(1, ...weeks.map((week) => week.workouts));
  return `
    <div class="bars" role="list" aria-label="${t('weeks.label')}">
      ${weeks.map((week) => `
        <div class="bar-row" role="listitem">
          <span>${t('weeks.from', { date: formatShortDate(week.weekStart) })}</span>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill" style="width: ${Math.round((week.workouts / max) * 100)}%"></div>
          </div>
          <span class="numeric">${week.workouts}</span>
        </div>`).join('')}
    </div>`;
}

export async function renderProgress({ isCurrent }) {
  const workouts = await fetchWorkouts();
  if (!isCurrent()) {
    return;
  }
  const weeks = weeklyWorkoutCounts(workouts, 8);
  const rows = [...weeks].reverse();

  setView(`
    <section>
      <div class="page-head">
        <div>
          <h1>${t('nav.progress')}</h1>
          <p>${t('progress.subtitle')}</p>
        </div>
      </div>

      <div class="grid grid-two">
        <div class="card">
          <div class="card-head"><h2>${t('weeks.label')}</h2></div>
          ${renderWeekBars(weeks)}
        </div>
        <div class="card">
          <div class="card-head"><h2>${t('progress.table')}</h2></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">${t('progress.weekOf')}</th><th scope="col" class="numeric">${t('nav.workouts')}</th><th scope="col" class="numeric">${t('progress.sets')}</th></tr>
              </thead>
              <tbody>
                ${rows.map((week) => `
                  <tr>
                    <td>${formatDate(week.weekStart)}</td>
                    <td class="numeric">${week.workouts}</td>
                    <td class="numeric">${week.sets}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="alert alert-info" style="margin-top: 1rem">${t('progress.note')}</div>
    </section>
  `);
}

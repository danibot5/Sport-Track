import { fetchWorkouts } from '../api.js';
import { formatDate, formatShortDate } from '../format.js';
import { weeklyWorkoutCounts } from '../stats.js';
import { setView } from '../ui.js';

export function renderWeekBars(weeks) {
  const max = Math.max(1, ...weeks.map((week) => week.workouts));
  return `
    <div class="bars" role="list" aria-label="Тренировки по седмици">
      ${weeks.map((week) => `
        <div class="bar-row" role="listitem">
          <span>от ${formatShortDate(week.weekStart)}</span>
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
          <h1>Прогрес</h1>
          <p>Брой тренировки и серии за последните 8 седмици.</p>
        </div>
      </div>

      <div class="grid grid-two">
        <div class="card">
          <div class="card-head"><h2>Тренировки по седмици</h2></div>
          ${renderWeekBars(weeks)}
        </div>
        <div class="card">
          <div class="card-head"><h2>Таблица</h2></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">Седмица от</th><th scope="col" class="numeric">Тренировки</th><th scope="col" class="numeric">Серии</th></tr>
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

      <div class="alert alert-info" style="margin-top: 1rem">
        Графиките с Chart.js и изчисляването на тренировъчното натоварване (обем = повторения × тежест) ще бъдат добавени в Седмица 4.
      </div>
    </section>
  `);
}

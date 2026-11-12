import { isConfigured, supabase } from './supabaseClient.js';
import { getDisplayName, getUser, loadProfile, loadSession, setSessionUser, signOut } from './auth.js';
import { navigate, resolveRoute } from './router.js';
import { renderError, setView, showLoading, showToast } from './ui.js';
import { translateError } from './errors.js';
import { renderLogin } from './views/login.js';
import { renderRegister } from './views/register.js';
import { renderDashboard } from './views/dashboard.js';
import { renderExercises } from './views/exercises.js';
import { renderWorkouts } from './views/workouts.js';
import { renderPlans } from './views/plans.js';
import { renderGoals } from './views/goals.js';
import { renderProgress } from './views/progress.js';
import { renderSetupNotice } from './views/setup.js';

const ROUTES = {
  login: { render: renderLogin, title: 'Вход' },
  register: { render: renderRegister, title: 'Регистрация' },
  dashboard: { render: renderDashboard, title: 'Табло' },
  workouts: { render: renderWorkouts, title: 'Тренировки' },
  plans: { render: renderPlans, title: 'Планове' },
  exercises: { render: renderExercises, title: 'Упражнения' },
  goals: { render: renderGoals, title: 'Цели' },
  progress: { render: renderProgress, title: 'Прогрес' }
};

const header = document.getElementById('app-header');
const nav = document.getElementById('main-nav');
const menuToggle = document.getElementById('menu-toggle');
const userName = document.getElementById('nav-user-name');
const logoutButton = document.getElementById('logout-btn');

let renderToken = 0;

function updateChrome(routeName) {
  const loggedIn = Boolean(getUser());
  header.hidden = !loggedIn;
  userName.textContent = getDisplayName();
  nav.querySelectorAll('a[data-route]').forEach((link) => {
    if (link.dataset.route === routeName) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  closeMenu();
}

function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

async function router() {
  const route = resolveRoute(window.location.hash, Boolean(getUser()), Object.keys(ROUTES));
  if (route.redirect) {
    window.location.replace(`#/${route.name}`);
    return;
  }
  const token = ++renderToken;
  const { render, title } = ROUTES[route.name];
  document.title = `${title} · SportTrack`;
  updateChrome(route.name);
  showLoading();
  try {
    await render({ params: route.params, isCurrent: () => token === renderToken });
  } catch (error) {
    if (token === renderToken) {
      setView(renderError(translateError(error)));
    }
  }
  if (token === renderToken) {
    document.getElementById('main').focus({ preventScroll: true });
  }
}

function bindChrome() {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut();
      showToast('Излязохте от профила си.');
    } catch (error) {
      showToast(translateError(error), 'error');
    }
    navigate('login');
  });

  window.addEventListener('hashchange', router);
}

async function start() {
  if (!isConfigured) {
    renderSetupNotice();
    return;
  }

  try {
    await loadSession();
  } catch (error) {
    showToast(translateError(error), 'error');
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const previousUserId = getUser()?.id;
    setSessionUser(session?.user ?? null);
    if (event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && previousUserId !== session?.user?.id)) {
      setTimeout(async () => {
        await loadProfile().catch(() => null);
        router();
      }, 0);
    }
  });

  bindChrome();
  router();
}

start();

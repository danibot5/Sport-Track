import { isConfigured, supabase } from './supabaseClient.js';
import { getDisplayName, getUser, loadProfile, loadSession, setSessionUser, signOut } from './auth.js';
import { navigate, resolveRoute } from './router.js';
import { renderError, setView, showLoading, showToast } from './ui.js';
import { translateError } from './errors.js';
import { getLang, setLang, t, translate } from './i18n.js';
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
  login: renderLogin,
  register: renderRegister,
  dashboard: renderDashboard,
  workouts: renderWorkouts,
  plans: renderPlans,
  exercises: renderExercises,
  goals: renderGoals,
  progress: renderProgress
};

const header = document.getElementById('app-header');
const nav = document.getElementById('main-nav');
const menuToggle = document.getElementById('menu-toggle');
const userName = document.getElementById('nav-user-name');
const logoutButton = document.getElementById('logout-btn');

let renderToken = 0;
let currentRoute = 'login';

function updateTitle() {
  document.title = `${t(`nav.${currentRoute}`)} · SportTrack`;
}

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
  const render = ROUTES[route.name];
  currentRoute = route.name;
  updateTitle();
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
      showToast(t('nav.loggedOut'));
    } catch (error) {
      showToast(translateError(error), 'error');
    }
    navigate('login');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-lang-toggle]')) {
      return;
    }
    setLang(getLang() === 'bg' ? 'en' : 'bg');
    translate();
    updateTitle();
  });

  window.addEventListener('hashchange', router);
}

async function start() {
  setLang(getLang());
  translate();

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

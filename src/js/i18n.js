export const TRANSLATIONS = {
  bg: {
    'lang.switch': 'EN',
    'lang.switchLabel': 'Switch to English',
    'common.loading': 'Зареждане…',
    'common.skip': 'Към съдържанието',
    'common.footer': 'SportTrack е учебен проект за проследяване на тренировки. Не е медицинска система и не дава здравни съвети.',
    'nav.menu': 'Меню',
    'nav.main': 'Основна навигация',
    'nav.login': 'Вход',
    'nav.register': 'Регистрация',
    'nav.dashboard': 'Табло',
    'nav.workouts': 'Тренировки',
    'nav.plans': 'Планове',
    'nav.exercises': 'Упражнения',
    'nav.goals': 'Цели',
    'nav.progress': 'Прогрес',
    'nav.logout': 'Изход',
    'nav.loggedOut': 'Излязохте от профила си.',
    'auth.email': 'Имейл',
    'auth.password': 'Парола',
    'login.intro': 'Планирай, записвай и следи тренировките си.',
    'login.submit': 'Вход',
    'login.busy': 'Влизане…',
    'login.noAccount': 'Нямате профил?',
    'login.welcome': 'Добре дошли отново!',
    'register.intro': 'Създайте профил, за да пазите тренировките си.',
    'register.name': 'Име за показване',
    'register.passwordHint': 'Поне 8 символа, с буква и цифра.',
    'register.confirm': 'Повторете паролата',
    'register.submit': 'Създай профил',
    'register.busy': 'Създаване…',
    'register.haveAccount': 'Имате профил?',
    'register.created': 'Профилът е създаден!',
    'register.confirmEmail': 'Профилът е създаден. Проверете имейла си и потвърдете регистрацията, след което влезте.',
    'dash.hello': 'Здравей',
    'dash.summary': 'Ето обобщение на тренировките ти.',
    'dash.workoutsWeek': 'Тренировки тази седмица',
    'dash.setsWeek': 'Серии тази седмица',
    'dash.totalWorkouts': 'Общо тренировки',
    'dash.activeGoals': 'Активни цели',
    'dash.activeGoal': 'Активна цел',
    'dash.noGoal': 'Нямате активна цел.',
    'dash.seeGoals': 'Вижте целите',
    'dash.goalProgress': 'Напредък към целта',
    'dash.target': 'Цел',
    'dash.thisWeek': 'тази седмица',
    'dash.due': 'Срок',
    'dash.last4': 'Последни 4 седмици',
    'dash.recent': 'Последни тренировки',
    'dash.all': 'Всички',
    'dash.noWorkouts': 'Все още нямате записани тренировки.',
    'dash.sets': 'Серии',
    'goalType.workouts_per_week': 'Тренировки седмично',
    'goalType.weekly_volume': 'Седмичен обем',
    'goalType.custom': 'Лична цел',
    'weeks.label': 'Тренировки по седмици',
    'weeks.from': 'от'
  },
  en: {
    'lang.switch': 'BG',
    'lang.switchLabel': 'Превключи на български',
    'common.loading': 'Loading…',
    'common.skip': 'Skip to content',
    'common.footer': 'SportTrack is a school project for tracking workouts. It is not a medical system and does not give health advice.',
    'nav.menu': 'Menu',
    'nav.main': 'Main navigation',
    'nav.login': 'Log in',
    'nav.register': 'Sign up',
    'nav.dashboard': 'Dashboard',
    'nav.workouts': 'Workouts',
    'nav.plans': 'Plans',
    'nav.exercises': 'Exercises',
    'nav.goals': 'Goals',
    'nav.progress': 'Progress',
    'nav.logout': 'Log out',
    'nav.loggedOut': 'You have logged out.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'login.intro': 'Plan, log and track your workouts.',
    'login.submit': 'Log in',
    'login.busy': 'Logging in…',
    'login.noAccount': 'No account yet?',
    'login.welcome': 'Welcome back!',
    'register.intro': 'Create an account to keep your workouts.',
    'register.name': 'Display name',
    'register.passwordHint': 'At least 8 characters, with a letter and a digit.',
    'register.confirm': 'Repeat the password',
    'register.submit': 'Create account',
    'register.busy': 'Creating…',
    'register.haveAccount': 'Already have an account?',
    'register.created': 'Account created!',
    'register.confirmEmail': 'Account created. Check your email and confirm the sign-up, then log in.',
    'dash.hello': 'Hi',
    'dash.summary': 'Here is a summary of your workouts.',
    'dash.workoutsWeek': 'Workouts this week',
    'dash.setsWeek': 'Sets this week',
    'dash.totalWorkouts': 'Total workouts',
    'dash.activeGoals': 'Active goals',
    'dash.activeGoal': 'Active goal',
    'dash.noGoal': 'You have no active goal.',
    'dash.seeGoals': 'See goals',
    'dash.goalProgress': 'Goal progress',
    'dash.target': 'Target',
    'dash.thisWeek': 'this week',
    'dash.due': 'Due',
    'dash.last4': 'Last 4 weeks',
    'dash.recent': 'Recent workouts',
    'dash.all': 'All',
    'dash.noWorkouts': 'You have not logged any workouts yet.',
    'dash.sets': 'Sets',
    'goalType.workouts_per_week': 'Workouts per week',
    'goalType.weekly_volume': 'Weekly volume',
    'goalType.custom': 'Personal goal',
    'weeks.label': 'Workouts per week',
    'weeks.from': 'from'
  }
};

const STORAGE_KEY = 'sporttrack-lang';

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let currentLang = TRANSLATIONS[readStoredLang()] ? readStoredLang() : 'bg';

export function getLang() {
  return currentLang;
}

export function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.bg[key] ?? key;
}

export function translate(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nLabel));
  });
}

export function setLang(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : 'bg';
  document.documentElement.lang = currentLang;
  try {
    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch {
    return;
  }
}

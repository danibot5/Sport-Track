import { logo } from '../logo.js';
import { signIn } from '../auth.js';
import { translateError } from '../errors.js';
import { t } from '../i18n.js';
import { navigate } from '../router.js';
import { setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateLogin } from '../validation.js';

export async function renderLogin() {
  const main = setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        <button class="btn btn-ghost btn-small lang-toggle" type="button" data-lang-toggle data-i18n="lang.switch" data-i18n-label="lang.switchLabel"></button>
        <a class="brand" href="#/login">${logo()}<span>SportTrack</span></a>
        <h1 data-i18n="nav.login"></h1>
        <p class="auth-intro" data-i18n="login.intro"></p>
        <form class="form" id="login-form" novalidate>
          <div class="alert" role="alert"></div>
          <div class="field">
            <label for="login-email" data-i18n="auth.email"></label>
            <input id="login-email" name="email" type="email" autocomplete="email" required>
            <p class="field-error" data-error-for="email"></p>
          </div>
          <div class="field">
            <label for="login-password" data-i18n="auth.password"></label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required>
            <p class="field-error" data-error-for="password"></p>
          </div>
          <button class="btn btn-block" type="submit" data-i18n="login.submit"></button>
        </form>
        <p class="auth-switch"><span data-i18n="login.noAccount"></span> <a href="#/register" data-i18n="nav.register"></a></p>
      </div>
    </section>
  `);

  const form = main.querySelector('#login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = {
      email: form.elements.email.value,
      password: form.elements.password.value
    };
    const { valid, errors } = validateLogin(values);
    showFieldErrors(form, errors);
    setFormAlert(form, '');
    if (!valid) {
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, t('login.busy'));
    try {
      await signIn(values.email, values.password);
      showToast(t('login.welcome'), 'success');
      navigate('dashboard');
    } catch (error) {
      setFormAlert(form, translateError(error));
      setBusy(button, false);
    }
  });
}

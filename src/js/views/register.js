import { logo } from '../logo.js';
import { signUp } from '../auth.js';
import { translateError } from '../errors.js';
import { t } from '../i18n.js';
import { navigate } from '../router.js';
import { langToggle, setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateRegistration } from '../validation.js';

export async function renderRegister() {
  const main = setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        ${langToggle()}
        <a class="brand" href="#/login">${logo()}<span>SportTrack</span></a>
        <h1>${t('nav.register')}</h1>
        <p class="auth-intro">${t('register.intro')}</p>
        <form class="form" id="register-form" novalidate>
          <div class="alert" role="alert"></div>
          <div class="field">
            <label for="register-name">${t('register.name')}</label>
            <input id="register-name" name="displayName" type="text" autocomplete="nickname" maxlength="50" required>
            <p class="field-error" data-error-for="displayName"></p>
          </div>
          <div class="field">
            <label for="register-email">${t('auth.email')}</label>
            <input id="register-email" name="email" type="email" autocomplete="email" required>
            <p class="field-error" data-error-for="email"></p>
          </div>
          <div class="field">
            <label for="register-password">${t('auth.password')}</label>
            <input id="register-password" name="password" type="password" autocomplete="new-password" aria-describedby="register-password-hint" required>
            <p class="field-hint" id="register-password-hint">${t('register.passwordHint')}</p>
            <p class="field-error" data-error-for="password"></p>
          </div>
          <div class="field">
            <label for="register-confirm">${t('register.confirm')}</label>
            <input id="register-confirm" name="confirmPassword" type="password" autocomplete="new-password" required>
            <p class="field-error" data-error-for="confirmPassword"></p>
          </div>
          <button class="btn btn-block" type="submit">${t('register.submit')}</button>
        </form>
        <p class="auth-switch">${t('register.haveAccount')} <a href="#/login">${t('nav.login')}</a></p>
      </div>
    </section>
  `);

  const form = main.querySelector('#register-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = {
      displayName: form.elements.displayName.value,
      email: form.elements.email.value,
      password: form.elements.password.value,
      confirmPassword: form.elements.confirmPassword.value
    };
    const { valid, errors } = validateRegistration(values);
    showFieldErrors(form, errors);
    setFormAlert(form, '');
    if (!valid) {
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true, t('register.busy'));
    try {
      const data = await signUp(values);
      if (data.session) {
        showToast(t('register.created'), 'success');
        navigate('dashboard');
        return;
      }
      form.reset();
      setFormAlert(form, t('register.confirmEmail'), 'success');
      setBusy(button, false);
    } catch (error) {
      setFormAlert(form, translateError(error));
      setBusy(button, false);
    }
  });
}

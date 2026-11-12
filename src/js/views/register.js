import { logo } from '../logo.js';
import { signUp } from '../auth.js';
import { translateError } from '../errors.js';
import { navigate } from '../router.js';
import { setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateRegistration } from '../validation.js';

export async function renderRegister() {
  const main = setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        <a class="brand" href="#/login">${logo()}<span>SportTrack</span></a>
        <h1>Регистрация</h1>
        <p class="auth-intro">Създайте профил, за да пазите тренировките си.</p>
        <form class="form" id="register-form" novalidate>
          <div class="alert" role="alert"></div>
          <div class="field">
            <label for="register-name">Име за показване</label>
            <input id="register-name" name="displayName" type="text" autocomplete="nickname" maxlength="50" required>
            <p class="field-error" data-error-for="displayName"></p>
          </div>
          <div class="field">
            <label for="register-email">Имейл</label>
            <input id="register-email" name="email" type="email" autocomplete="email" required>
            <p class="field-error" data-error-for="email"></p>
          </div>
          <div class="field">
            <label for="register-password">Парола</label>
            <input id="register-password" name="password" type="password" autocomplete="new-password" aria-describedby="register-password-hint" required>
            <p class="field-hint" id="register-password-hint">Поне 8 символа, с буква и цифра.</p>
            <p class="field-error" data-error-for="password"></p>
          </div>
          <div class="field">
            <label for="register-confirm">Повторете паролата</label>
            <input id="register-confirm" name="confirmPassword" type="password" autocomplete="new-password" required>
            <p class="field-error" data-error-for="confirmPassword"></p>
          </div>
          <button class="btn btn-block" type="submit">Създай профил</button>
        </form>
        <p class="auth-switch">Имате профил? <a href="#/login">Вход</a></p>
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
    setBusy(button, true, 'Създаване…');
    try {
      const data = await signUp(values);
      if (data.session) {
        showToast('Профилът е създаден!', 'success');
        navigate('dashboard');
        return;
      }
      form.reset();
      setFormAlert(form, 'Профилът е създаден. Проверете имейла си и потвърдете регистрацията, след което влезте.', 'success');
      setBusy(button, false);
    } catch (error) {
      setFormAlert(form, translateError(error));
      setBusy(button, false);
    }
  });
}

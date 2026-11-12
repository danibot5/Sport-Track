import { logo } from '../logo.js';
import { signIn } from '../auth.js';
import { translateError } from '../errors.js';
import { navigate } from '../router.js';
import { setBusy, setFormAlert, setView, showFieldErrors, showToast } from '../ui.js';
import { validateLogin } from '../validation.js';

export async function renderLogin() {
  const main = setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        <a class="brand" href="#/login">${logo()}<span>SportTrack</span></a>
        <h1>Вход</h1>
        <p class="auth-intro">Планирай, записвай и следи тренировките си.</p>
        <form class="form" id="login-form" novalidate>
          <div class="alert" role="alert"></div>
          <div class="field">
            <label for="login-email">Имейл</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required>
            <p class="field-error" data-error-for="email"></p>
          </div>
          <div class="field">
            <label for="login-password">Парола</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required>
            <p class="field-error" data-error-for="password"></p>
          </div>
          <button class="btn btn-block" type="submit">Вход</button>
        </form>
        <p class="auth-switch">Нямате профил? <a href="#/register">Регистрация</a></p>
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
    setBusy(button, true, 'Влизане…');
    try {
      await signIn(values.email, values.password);
      showToast('Добре дошли отново!', 'success');
      navigate('dashboard');
    } catch (error) {
      setFormAlert(form, translateError(error));
      setBusy(button, false);
    }
  });
}

import { t } from '../i18n.js';
import { langToggle, setView } from '../ui.js';

export function renderSetupNotice() {
  setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        ${langToggle()}
        <h1>${t('setup.title')}</h1>
        <p>${t('setup.text')}</p>
        <ol>
          <li>${t('setup.step1', { a: '<code>.env.example</code>', b: '<code>.env</code>' })}</li>
          <li>${t('setup.step2', { a: '<code>VITE_SUPABASE_URL</code>', b: '<code>VITE_SUPABASE_PUBLISHABLE_KEY</code>' })}</li>
          <li>${t('setup.step3', { a: '<code>npm run dev</code>' })}</li>
        </ol>
        <p class="field-hint">${t('setup.hint', { a: '<code>docs/SUPABASE_SETUP.md</code>' })}</p>
      </div>
    </section>
  `);
}

import { setView } from '../ui.js';

export function renderSetupNotice() {
  setView(`
    <section class="auth-wrap">
      <div class="card auth-card">
        <h1>Липсва връзка със Supabase</h1>
        <p>Приложението не намира адреса и публичния ключ на Supabase проекта.</p>
        <ol>
          <li>Копирайте файла <code>.env.example</code> като <code>.env</code>.</li>
          <li>Попълнете <code>VITE_SUPABASE_URL</code> и <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.</li>
          <li>Рестартирайте <code>npm run dev</code>.</li>
        </ol>
        <p class="field-hint">Подробни стъпки има в <code>docs/SUPABASE_SETUP.md</code>.</p>
      </div>
    </section>
  `);
}

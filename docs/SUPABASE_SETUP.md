# Настройка на Supabase и стартиране на приложението

Ръководството е стъпка по стъпка. Изпълнява се веднъж от единия член на екипа. После той споделя с другия адреса и публичния ключ на проекта (или го кани в проекта от Supabase → Organization → Team).

## 1. Създаване на проект

1. Отворете https://supabase.com и натиснете **Start your project**. Влезте с GitHub акаунта си.
2. Ако бъдете попитани, създайте организация (Free план).
3. Натиснете **New project**:
   - **Name:** `SportTrack`
   - **Database Password:** натиснете **Generate a password** и я запазете на сигурно място. **Не я слагайте в Git.**
   - **Region:** `Central EU (Frankfurt)` (най-близо до България).
4. Натиснете **Create new project** и изчакайте около 1–2 минути.

## 2. Създаване на таблиците (schema.sql)

1. От лявото меню изберете **SQL Editor** → **New query**.
2. Копирайте цялото съдържание на [`database/schema.sql`](../database/schema.sql), поставете го и натиснете **Run**.
3. Ако Supabase предупреди за „destructive operation“, потвърдете. Предупреждението идва от редовете `drop table if exists`, които позволяват файлът да се пуска повторно.
4. Очакван резултат: `Success. No rows returned`.
5. Проверете в **Table Editor**, че има 7 таблици: `profiles`, `exercises`, `plans`, `plan_items`, `workouts`, `workout_items`, `goals`. До всяка трябва да пише, че RLS е включен.

> ⚠️ Повторно пускане на `schema.sql` **изтрива всички данни** в тези таблици. Акаунтите в Authentication остават, а профилите им се създават отново автоматично. След това пуснете `seed.sql`, за да върнете демо данните.
>
> Бутонът **Save** в SQL Editor само запазва текста на заявката в списъка вляво. Той не променя базата.

## 3. Настройки на влизането (Authentication)

1. **Authentication → Sign In / Providers → Email**: изключете **Confirm email** и запазете.
   Докато разработваме, така не се изпращат имейли до тестови адреси. Supabase ограничава проекти, при които много имейли се връщат като недоставени. Преди публичната версия в Седмица 5 можем да го включим отново.
2. **Authentication → URL Configuration → Site URL**: `http://localhost:5173`.
   След публикуване в GitHub Pages добавете и `https://danibot5.github.io/Sport-Track/` в **Redirect URLs**.

## 4. Тестови акаунти

**Authentication → Users → Add user → Create new user**:

| Имейл | За какво е |
| --- | --- |
| `demo@sporttrack.test` | основен демо акаунт с готови данни |
| `test2@sporttrack.test` | втори акаунт за проверка, че не вижда чуждите данни |

Задайте парола (поне 8 символа, с буква и цифра) и отметнете **Auto Confirm User**. Паролите се дават на учителя при предаването. В кода не се пазят.

## 5. Тестови данни (seed.sql)

1. **SQL Editor → New query**, поставете съдържанието на [`database/seed.sql`](../database/seed.sql) и натиснете **Run**.
2. Файлът добавя 13 общи упражнения. Ако съществува `demo@sporttrack.test`, добавя и:
   - 1 собствено упражнение;
   - 2 плана;
   - 6 тренировки за последните 2 седмици;
   - 3 цели.
3. Датите се смятат спрямо днешния ден, затова файлът може да се пуска отново преди демонстрация. Той изтрива и пресъздава демо данните.

## 6. Свързване на приложението

1. В Supabase натиснете **Connect** (горе в средата) или отворете **Project Settings → API Keys**.
2. Копирайте:
   - **Project URL**, например `https://abcd1234.supabase.co`;
   - **Publishable key** (`sb_publishable_...`). Ако виждате само legacy ключове, вземете **anon public**.
3. В корена на проекта копирайте `.env.example` като `.env` и попълнете двата реда:

   ```text
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

4. **Никога не използвайте `secret` / `service_role` ключа в приложението.** Той заобикаля RLS. Файлът `.env` е в `.gitignore` и не се качва в GitHub.

## 7. Стартиране

Нужен е Node.js 20 или по-нов (https://nodejs.org).

```bash
npm install
npm run dev
```

Отворете http://localhost:5173 и влезте с `demo@sporttrack.test`.

Други команди:

```bash
npm test
npm run build
```

## 8. Роля администратор (по желание)

Администраторът може да добавя и изтрива **общи** упражнения. Ролята се дава само от SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'demo@sporttrack.test');
```

## 9. Публикуване в GitHub Pages (Седмица 5)

1. GitHub → **Settings → Secrets and variables → Actions → New repository secret**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. GitHub → **Settings → Pages → Source: GitHub Actions**.
3. При всеки push в `main` файлът `.github/workflows/deploy.yml` пуска тестовете, прави build и публикува сайта на `https://danibot5.github.io/Sport-Track/`.

## Чести проблеми

| Симптом | Решение |
| --- | --- |
| „Липсва връзка със Supabase“ | Няма `.env` или е попълнен грешно. Рестартирайте `npm run dev` след промяна. |
| „Грешен имейл или парола“ | Проверете акаунта в Authentication → Users и дали е потвърден. |
| „Имейлът не е потвърден“ | Изключете Confirm email (стъпка 3) или потвърдете потребителя ръчно. |
| Таблото е празно | Пуснете `seed.sql` след създаването на `demo@sporttrack.test`. |

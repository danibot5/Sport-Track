# CLAUDE.md – project memory for SportTrack

## Assignment (from the teacher, in Bulgarian)

Two-person team, 5 weeks, theme "проследяване на тренировки" for students and sport amateurs.
Required features: планове, упражнения, тренировки, цели, графики и прогрес. Plus auth, roles if needed, input validation, Supabase storage, error messages, responsive UI.
Must NOT be presented as a medical system.
Own algorithm: тренировъчно натоварване и прогрес (inputs, steps, output, edge cases, complexity, ≥3 manual examples, automated tests).

| Week | Deliverables |
| --- | --- |
| 1 | RESEARCH.md, PROJECT_PLAN.md, PRODUCT_SPEC.md, ER diagram, ≥12 Issues, mockups |
| 2 | Working prototype, SQL schema, first functional screens, ≥3 related tables, test data, RLS |
| 3 | MVP: main scenarios, CRUD, validation, save/load, demo data, commits from both students |
| 4 | Algorithm implemented and explained, statistics, error handling, ≥10 test cases, Chart.js |
| 5 | Security/RLS check, mobile, edge cases, user testing, public demo, presentation 10–12 slides, test accounts |

Final repo must contain: README.md, LICENSE, .gitignore, .env.example, docs/{RESEARCH, PROJECT_PLAN, PRODUCT_SPEC, AI_USAGE, TESTS, SOURCES, USER_GUIDE}.md, database/schema.sql, src/, tests/, presentation/.

## Status

- Week 1: done (docs moved into docs/, mockups added in week 2).
- Week 2: done. Prototype, schema, seed, RLS, 30 Vitest tests, GitHub Actions workflow.
- Next is week 3: forms for creating, editing and deleting workouts (with sets), plans (with plan_items), goals; start a workout from a plan; edit display name.
- Week 4 algorithm idea is already described in docs/PROJECT_PLAN.md (volume = reps × kg, weekly comparison, "няма база за сравнение" when the previous week is 0). Put it in src/js/stats.js or a new src/js/algorithm.js with tests.

## User preferences

- Communicate in Bulgarian. The user (Dani, branch `dani-branch`) is not deeply familiar with the project, so explain briefly what is happening.
- **No comments in code.**
- Keep docs/*.md up to date after every change (README status table, WEEK_N_REPORT, TESTS.md, AI_USAGE.md, GITHUB_ISSUES.md).
- Teammate: Niki (`niki-branch`). Roles in PROJECT_PLAN: Ученик 1 = UI/HTML/CSS/Chart.js, Ученик 2 = Supabase/JS/RLS/Vitest. The real names are not filled in yet.
- Do not commit or push unless asked.

## Repository layout

The repo is `C:\Users\TestGame\Documents\GitHub\Sport-Track` (remote github.com/danibot5/Sport-Track). The old nested double folder was flattened by the user on 2026-11-12. GitHub Pages source is set to GitHub Actions, but the secrets are not added yet.

```
database/schema.sql   drops and recreates all tables, functions, trigger, RLS (re-runnable; wipes data, backfills profiles from auth.users)
database/seed.sql     13 global exercises + demo data for demo@sporttrack.test (dates relative to current_date)
src/index.html        shell: header nav, <main id="main">, toast region, footer disclaimer
src/css/styles.css    design tokens in :root, dark mode via prefers-color-scheme, breakpoints 860px / 480px
src/js/main.js        route table, auth state listener, menu toggle, logout
src/js/router.js      hash router (#/name/param), parseHash/resolveRoute are pure and tested
src/js/supabaseClient.js  reads VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY; isConfigured flag
src/js/auth.js        session/profile state, signIn/signUp/signOut
src/js/api.js         all Supabase queries (fetch*/create*/delete*)
src/js/validation.js  pure validators returning { valid, errors: {field: message} }
src/js/errors.js      translateError: Supabase/Postgres errors -> Bulgarian messages
src/js/stats.js       workoutsInWeek, weeklyWorkoutCounts, goalProgress (weeks start Monday)
src/js/format.js      bg-BG date/number formatting, labels for categories and goal types
src/js/ui.js          escapeHtml, setView, showToast, showFieldErrors, setFormAlert, setBusy
src/js/views/*.js     one render function per screen: render({ params, isCurrent })
tests/*.test.js       Vitest (node environment)
.github/workflows/deploy.yml  npm ci, test, build with secrets, deploy to GitHub Pages on main
```

Conventions:
- Views build HTML with template strings. **Always escapeHtml user data.**
- Forms use `novalidate`, `.field-error[data-error-for=name]` and an `.alert` box for server errors.
- Check `isCurrent()` after every await in views, so stale renders are dropped.
- Vite root is `src/`, envDir is the repo root, build goes to `dist/`, base `./` for GitHub Pages.

## Database facts

Tables: profiles(id=auth.users.id, display_name, role user|admin), exercises(user_id NULL = global), plans, plan_items(target_sets/reps/weight/duration, position), workouts(plan_id nullable, set null on plan delete), workout_items(set_number, repetitions, weight_kg, duration_minutes; reps or duration required), goals(goal_type workouts_per_week|weekly_volume|custom).
- exercise FK from items is `on delete restrict` -> deleting a used exercise gives 23503 (translated message).
- Unique exercise name per user (case-insensitive) -> 23505.
- Users can only update `profiles.display_name` (column grant). `role` changes only via SQL editor.
- `is_admin()` is security definer to avoid RLS recursion.
- Verified locally with PGlite and a stub `auth` schema (script lived in the scratchpad; recreate if needed: stub auth.users, auth.uid() from request.jwt.claim.sub, roles anon/authenticated).

## Supabase setup status

The user follows docs/SUPABASE_SETUP.md: create project, run schema.sql, disable "Confirm email", create demo@sporttrack.test and test2@sporttrack.test (auto confirm), run seed.sql, fill .env.
Before week 5: add GitHub secrets VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY and set Pages source to GitHub Actions.

## Verification tips

- `npm test`, `npm run build`.
- To see the screens without a real Supabase: run Vite with a config that aliases `@supabase/supabase-js` to a mock module that returns canned data (keep it outside the repo).

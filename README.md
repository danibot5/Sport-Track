# SportTrack

Уеб приложение за ученици и любители на спорта. Помага им да планират, записват и проследяват тренировките си. Приложението не е медицинска система и не дава здравни съвети.

## Текущ етап

**Седмица 2:** работещ прототип с вход и регистрация, навигация, адаптивен дизайн и 7 свързани таблици в Supabase с RLS политики и тестови данни.

| Седмица | Резултат | Статус |
| --- | --- | --- |
| 1 | Проучване, план, спецификация, макети, ER диаграма, Issues | ✅ |
| 2 | Начални екрани, навигация, SQL схема, RLS, тестови данни | ✅ |
| 3 | CRUD операции, работещ MVP | ⏳ |
| 4 | Собствен алгоритъм, графики, тестове | ⏳ |
| 5 | Тестване, публикуване, презентация | ⏳ |

## Технологии

HTML5, CSS3, JavaScript (ES6+ модули), [Vite](https://vite.dev), [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS), [Vitest](https://vitest.dev), GitHub Actions и GitHub Pages. Chart.js ще бъде добавен в Седмица 4.

## Бързо стартиране

1. Настройте Supabase проект по [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
2. Копирайте `.env.example` като `.env` и попълнете адреса и публичния ключ.
3. Стартирайте:

```bash
npm install
npm run dev
```

Приложението се отваря на http://localhost:5173.

| Команда | Действие |
| --- | --- |
| `npm run dev` | стартира приложението локално |
| `npm test` | пуска автоматизираните тестове |
| `npm run build` | създава версия за публикуване в `dist/` |

## Документация

- [Проучване](docs/RESEARCH.md)
- [План на проекта](docs/PROJECT_PLAN.md)
- [Продуктова спецификация](docs/PRODUCT_SPEC.md)
- [ER диаграма и RLS политики](docs/ER_DIAGRAM.md)
- [Макети](docs/mockups/index.html)
- [Настройка на Supabase](docs/SUPABASE_SETUP.md)
- [Ръководство за потребителя](docs/USER_GUIDE.md)
- [Тестове](docs/TESTS.md)
- [Използване на ИИ](docs/AI_USAGE.md)
- [Източници и лицензи](docs/SOURCES.md)
- [Списък с GitHub Issues](docs/GITHUB_ISSUES.md)
- [Отчет за седмица 1](docs/WEEK_1_REPORT.md)
- [Отчет за седмица 2](docs/WEEK_2_REPORT.md)

## Структура

```text
database/      SQL схема (schema.sql) и тестови данни (seed.sql)
docs/          Документация, макети и планиране
src/           Код на приложението
  css/         Стилове
  js/          Логика: връзка със Supabase, вход, маршрути, валидация
  js/views/    Отделните екрани
tests/         Автоматизирани тестове (Vitest)
presentation/  Материали за защитата
.github/       GitHub Actions (тестове и публикуване)
```

## Тестови акаунти

`demo@sporttrack.test` (с демо данни) и `test2@sporttrack.test` (празен, за проверка на правата). Паролите се предоставят отделно при предаването.

## Лиценз

[MIT](LICENSE)

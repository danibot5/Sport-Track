# ER диаграма и начален модел на данните

```mermaid
erDiagram
  PROFILES ||--o{ EXERCISES : creates
  PROFILES ||--o{ WORKOUTS : records
  PROFILES ||--o{ GOALS : sets
  WORKOUTS ||--o{ WORKOUT_ITEMS : contains
  EXERCISES ||--o{ WORKOUT_ITEMS : is_logged_as
  PROFILES {
    uuid id PK
    text display_name
    timestamptz created_at
  }
  EXERCISES {
    uuid id PK
    uuid user_id FK
    text name
    text category
    boolean uses_weight
  }
  WORKOUTS {
    uuid id PK
    uuid user_id FK
    text title
    date workout_date
    text notes
  }
  WORKOUT_ITEMS {
    uuid id PK
    uuid workout_id FK
    uuid exercise_id FK
    integer set_number
    integer repetitions
    numeric weight_kg
    integer duration_minutes
  }
  GOALS {
    uuid id PK
    uuid user_id FK
    text title
    integer target_value
    text unit
    date due_date
    boolean completed
  }
```

## Таблици и връзки

| Таблица | Първичен ключ | Основни полета | Връзки |
| --- | --- | --- | --- |
| `profiles` | `id` | `display_name`, `created_at` | `id` е свързан със Supabase Auth потребител |
| `exercises` | `id` | `user_id`, `name`, `category`, `uses_weight` | много упражнения към един профил |
| `workouts` | `id` | `user_id`, `title`, `workout_date`, `notes` | много тренировки към един профил |
| `workout_items` | `id` | `workout_id`, `exercise_id`, `set_number`, `repetitions`, `weight_kg`, `duration_minutes` | много записи към една тренировка и едно упражнение |
| `goals` | `id` | `user_id`, `title`, `target_value`, `unit`, `due_date`, `completed` | много цели към един профил |

## Правила за данните

- `name` на упражнение и `title` на тренировка са задължителни.
- `repetitions`, `set_number` и `duration_minutes` са цели числа, по-големи или равни на 0.
- `weight_kg` е число, по-голямо или равно на 0.
- `workout_items.workout_id` и `workout_items.exercise_id` са външни ключове.
- В Седмица 2 ще се добавят RLS политики: потребителят чете и променя само редове със собствено `user_id`.

drop table if exists public.goals cascade;
drop table if exists public.workout_items cascade;
drop table if exists public.workouts cascade;
drop table if exists public.plan_items cascade;
drop table if exists public.plans cascade;
drop table if exists public.exercises cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.default_display_name(jsonb, text) cascade;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 50),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 60),
  category text not null default 'strength' check (category in ('strength', 'cardio', 'flexibility', 'other')),
  uses_weight boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index exercises_user_name_unique on public.exercises (user_id, lower(name)) where user_id is not null;
create unique index exercises_global_name_unique on public.exercises (lower(name)) where user_id is null;

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 60),
  description text check (description is null or char_length(description) <= 500),
  created_at timestamptz not null default now()
);

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null default 1 check (position >= 1),
  target_sets integer not null default 3 check (target_sets between 1 and 20),
  target_reps integer check (target_reps is null or target_reps between 1 and 200),
  target_weight_kg numeric(6, 2) check (target_weight_kg is null or target_weight_kg between 0 and 1000),
  target_duration_minutes integer check (target_duration_minutes is null or target_duration_minutes between 1 and 600),
  check (target_reps is not null or target_duration_minutes is not null)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 80),
  workout_date date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create table public.workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  set_number integer not null check (set_number between 1 and 50),
  repetitions integer check (repetitions is null or repetitions between 0 and 1000),
  weight_kg numeric(6, 2) check (weight_kg is null or weight_kg between 0 and 1000),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 600),
  check (repetitions is not null or duration_minutes is not null)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 80),
  goal_type text not null default 'workouts_per_week' check (goal_type in ('workouts_per_week', 'weekly_volume', 'custom')),
  target_value numeric(10, 2) not null check (target_value > 0),
  unit text not null check (char_length(trim(unit)) between 1 and 20),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index exercises_user_id_idx on public.exercises (user_id);
create index plans_user_id_idx on public.plans (user_id);
create index plan_items_plan_id_idx on public.plan_items (plan_id);
create index plan_items_exercise_id_idx on public.plan_items (exercise_id);
create index workouts_user_date_idx on public.workouts (user_id, workout_date desc);
create index workouts_plan_id_idx on public.workouts (plan_id);
create index workout_items_workout_id_idx on public.workout_items (workout_id);
create index workout_items_exercise_id_idx on public.workout_items (exercise_id);
create index goals_user_id_idx on public.goals (user_id);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.default_display_name(meta jsonb, email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when char_length(candidate) >= 2 then left(candidate, 50)
    else 'Потребител'
  end
  from (
    select coalesce(nullif(trim(meta ->> 'display_name'), ''), trim(split_part(coalesce(email, ''), '@', 1))) as candidate
  ) as source;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, public.default_display_name(new.raw_user_meta_data, new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select id, public.default_display_name(raw_user_meta_data, email)
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_items enable row level security;
alter table public.goals enable row level security;

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "exercises_select_own_or_global" on public.exercises
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "exercises_insert_own" on public.exercises
  for insert to authenticated
  with check (user_id = (select auth.uid()) or (user_id is null and (select public.is_admin())));

create policy "exercises_update_own" on public.exercises
  for update to authenticated
  using (user_id = (select auth.uid()) or (user_id is null and (select public.is_admin())))
  with check (user_id = (select auth.uid()) or (user_id is null and (select public.is_admin())));

create policy "exercises_delete_own" on public.exercises
  for delete to authenticated
  using (user_id = (select auth.uid()) or (user_id is null and (select public.is_admin())));

create policy "plans_all_own" on public.plans
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "plan_items_all_own" on public.plan_items
  for all to authenticated
  using (
    exists (select 1 from public.plans p where p.id = plan_items.plan_id and p.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.plans p where p.id = plan_items.plan_id and p.user_id = (select auth.uid()))
    and exists (
      select 1 from public.exercises e
      where e.id = plan_items.exercise_id and (e.user_id is null or e.user_id = (select auth.uid()))
    )
  );

create policy "workouts_all_own" on public.workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      workouts.plan_id is null
      or exists (select 1 from public.plans p where p.id = workouts.plan_id and p.user_id = (select auth.uid()))
    )
  );

create policy "workout_items_all_own" on public.workout_items
  for all to authenticated
  using (
    exists (select 1 from public.workouts w where w.id = workout_items.workout_id and w.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.workouts w where w.id = workout_items.workout_id and w.user_id = (select auth.uid()))
    and exists (
      select 1 from public.exercises e
      where e.id = workout_items.exercise_id and (e.user_id is null or e.user_id = (select auth.uid()))
    )
  );

create policy "goals_all_own" on public.goals
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.exercises, public.plans, public.plan_items, public.workouts, public.workout_items, public.goals to authenticated;
grant select on public.profiles to authenticated;

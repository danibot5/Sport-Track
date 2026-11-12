insert into public.exercises (user_id, name, category, uses_weight) values
  (null, 'Клек с щанга', 'strength', true),
  (null, 'Лежанка', 'strength', true),
  (null, 'Мъртва тяга', 'strength', true),
  (null, 'Раменна преса с дъмбели', 'strength', true),
  (null, 'Гребане с щанга', 'strength', true),
  (null, 'Набирания', 'strength', false),
  (null, 'Лицеви опори', 'strength', false),
  (null, 'Напади', 'strength', true),
  (null, 'Планк', 'other', false),
  (null, 'Бягане', 'cardio', false),
  (null, 'Колоездене', 'cardio', false),
  (null, 'Въже за скачане', 'cardio', false),
  (null, 'Разтягане на задно бедро', 'flexibility', false)
on conflict do nothing;

do $$
declare
  demo_email text := 'demo@sporttrack.test';
  uid uuid;
  own_exercise uuid;
  plan_a uuid;
  plan_b uuid;
  w uuid;
  squat uuid := (select id from public.exercises where user_id is null and name = 'Клек с щанга');
  bench uuid := (select id from public.exercises where user_id is null and name = 'Лежанка');
  deadlift uuid := (select id from public.exercises where user_id is null and name = 'Мъртва тяга');
  row_ex uuid := (select id from public.exercises where user_id is null and name = 'Гребане с щанга');
  pushups uuid := (select id from public.exercises where user_id is null and name = 'Лицеви опори');
  running uuid := (select id from public.exercises where user_id is null and name = 'Бягане');
  plank uuid := (select id from public.exercises where user_id is null and name = 'Планк');
begin
  select id into uid from auth.users where email = demo_email;

  if uid is null then
    raise notice 'Няма потребител с имейл %. Създайте го от Authentication > Users и пуснете файла отново.', demo_email;
    return;
  end if;

  insert into public.profiles (id, display_name)
  values (uid, 'Демо ученик')
  on conflict (id) do update set display_name = excluded.display_name;

  delete from public.goals where user_id = uid;
  delete from public.workouts where user_id = uid;
  delete from public.plans where user_id = uid;
  delete from public.exercises where user_id = uid;

  insert into public.exercises (user_id, name, category, uses_weight)
  values (uid, 'Хвърляне на медицинска топка', 'strength', true)
  returning id into own_exercise;

  insert into public.plans (user_id, name, description)
  values (uid, 'Цяло тяло А', 'Основна силова тренировка за начинаещи, 3 пъти седмично.')
  returning id into plan_a;

  insert into public.plan_items (plan_id, exercise_id, position, target_sets, target_reps, target_weight_kg) values
    (plan_a, squat, 1, 3, 8, 40),
    (plan_a, bench, 2, 3, 8, 30),
    (plan_a, row_ex, 3, 3, 10, 25);

  insert into public.plan_items (plan_id, exercise_id, position, target_sets, target_duration_minutes)
  values (plan_a, plank, 4, 2, 1);

  insert into public.plans (user_id, name, description)
  values (uid, 'Кардио и издръжливост', 'Лека кардио тренировка и упражнения със собствено тегло.')
  returning id into plan_b;

  insert into public.plan_items (plan_id, exercise_id, position, target_sets, target_duration_minutes)
  values (plan_b, running, 1, 1, 20);

  insert into public.plan_items (plan_id, exercise_id, position, target_sets, target_reps)
  values (plan_b, pushups, 2, 3, 15);

  insert into public.workouts (user_id, plan_id, title, workout_date, notes)
  values (uid, plan_a, 'Цяло тяло А', current_date - 15, 'Първа тренировка по плана.')
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, repetitions, weight_kg) values
    (w, squat, 1, 8, 35), (w, squat, 2, 8, 35), (w, squat, 3, 6, 35),
    (w, bench, 1, 8, 25), (w, bench, 2, 8, 25), (w, bench, 3, 7, 25);

  insert into public.workouts (user_id, plan_id, title, workout_date)
  values (uid, plan_b, 'Кардио', current_date - 13)
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, duration_minutes) values
    (w, running, 1, 18);
  insert into public.workout_items (workout_id, exercise_id, set_number, repetitions) values
    (w, pushups, 1, 12), (w, pushups, 2, 10), (w, pushups, 3, 10);

  insert into public.workouts (user_id, plan_id, title, workout_date)
  values (uid, plan_a, 'Цяло тяло А', current_date - 8)
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, repetitions, weight_kg) values
    (w, squat, 1, 8, 40), (w, squat, 2, 8, 40), (w, squat, 3, 8, 40),
    (w, bench, 1, 8, 27.5), (w, bench, 2, 8, 27.5), (w, bench, 3, 8, 27.5),
    (w, row_ex, 1, 10, 25), (w, row_ex, 2, 10, 25);

  insert into public.workouts (user_id, title, workout_date, notes)
  values (uid, 'Сила и техника', current_date - 6, 'Мъртва тяга с лека тежест, фокус върху техниката.')
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, repetitions, weight_kg) values
    (w, deadlift, 1, 6, 50), (w, deadlift, 2, 6, 50), (w, deadlift, 3, 6, 50),
    (w, own_exercise, 1, 10, 3), (w, own_exercise, 2, 10, 3);

  insert into public.workouts (user_id, plan_id, title, workout_date)
  values (uid, plan_a, 'Цяло тяло А', current_date - 2)
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, repetitions, weight_kg) values
    (w, squat, 1, 8, 42.5), (w, squat, 2, 8, 42.5), (w, squat, 3, 8, 42.5),
    (w, bench, 1, 8, 30), (w, bench, 2, 8, 30), (w, bench, 3, 6, 30),
    (w, row_ex, 1, 10, 27.5), (w, row_ex, 2, 10, 27.5), (w, row_ex, 3, 10, 27.5);
  insert into public.workout_items (workout_id, exercise_id, set_number, duration_minutes) values
    (w, plank, 1, 1), (w, plank, 2, 1);

  insert into public.workouts (user_id, plan_id, title, workout_date)
  values (uid, plan_b, 'Кардио', current_date)
  returning id into w;
  insert into public.workout_items (workout_id, exercise_id, set_number, duration_minutes) values
    (w, running, 1, 22);

  insert into public.goals (user_id, title, goal_type, target_value, unit, due_date) values
    (uid, '3 тренировки седмично', 'workouts_per_week', 3, 'тренировки', current_date + 30),
    (uid, 'Седмичен обем 3000 kg', 'weekly_volume', 3000, 'kg', current_date + 45);

  insert into public.goals (user_id, title, goal_type, target_value, unit, due_date, completed)
  values (uid, 'Да избягам 5 km без спиране', 'custom', 5, 'km', current_date - 3, true);

  raise notice 'Демо данните за % са създадени.', demo_email;
end;
$$;

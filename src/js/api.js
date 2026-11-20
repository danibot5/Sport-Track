import { supabase } from './supabaseClient.js';
import { getUser } from './auth.js';

function unwrap({ data, error }) {
  if (error) {
    throw error;
  }
  return data;
}

function byPosition(a, b) {
  return a.position - b.position;
}

function bySetNumber(a, b) {
  return a.set_number - b.set_number;
}

function emptyToNull(value) {
  return value === '' || value === undefined || value === null ? null : Number(value);
}

function textOrNull(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

export async function fetchExercises() {
  return unwrap(
    await supabase
      .from('exercises')
      .select('id, user_id, name, category, uses_weight, created_at')
      .order('name')
  );
}

export async function createExercise({ name, category, usesWeight }) {
  return unwrap(
    await supabase
      .from('exercises')
      .insert({ user_id: getUser().id, name: name.trim(), category, uses_weight: usesWeight })
      .select()
      .single()
  );
}

export async function updateExercise(id, { name, category, usesWeight }) {
  return unwrap(
    await supabase
      .from('exercises')
      .update({ name: name.trim(), category, uses_weight: usesWeight })
      .eq('id', id)
      .eq('user_id', getUser().id)
      .select()
      .single()
  );
}

export async function deleteExercise(id) {
  return unwrap(await supabase.from('exercises').delete().eq('id', id));
}

export async function fetchWorkouts() {
  return unwrap(
    await supabase
      .from('workouts')
      .select('id, title, workout_date, notes, plan:plans(name), workout_items(repetitions, weight_kg, duration_minutes)')
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
  );
}

export async function fetchWorkout(id) {
  const workout = unwrap(
    await supabase
      .from('workouts')
      .select(
        'id, plan_id, title, workout_date, notes, plan:plans(name), workout_items(id, set_number, repetitions, weight_kg, duration_minutes, exercise:exercises(id, name, uses_weight))'
      )
      .eq('id', id)
      .maybeSingle()
  );
  if (workout) {
    workout.workout_items.sort(bySetNumber);
  }
  return workout;
}

function workoutRow({ title, workoutDate, notes, planId }) {
  return {
    title: title.trim(),
    workout_date: workoutDate,
    notes: textOrNull(notes),
    plan_id: planId || null
  };
}

function workoutItemRows(workoutId, sets) {
  return sets.map((set, index) => ({
    workout_id: workoutId,
    exercise_id: set.exerciseId,
    set_number: index + 1,
    repetitions: emptyToNull(set.repetitions),
    weight_kg: emptyToNull(set.weightKg),
    duration_minutes: emptyToNull(set.durationMinutes)
  }));
}

export async function createWorkout(workout) {
  const created = unwrap(
    await supabase
      .from('workouts')
      .insert({ ...workoutRow(workout), user_id: getUser().id })
      .select('id')
      .single()
  );
  try {
    unwrap(await supabase.from('workout_items').insert(workoutItemRows(created.id, workout.sets)));
  } catch (error) {
    await supabase.from('workouts').delete().eq('id', created.id);
    throw error;
  }
  return created;
}

// Новите серии се добавят преди старите да се изтрият, за да не се загубят при грешка по средата.
export async function updateWorkout(id, workout, oldItemIds = []) {
  unwrap(await supabase.from('workouts').update(workoutRow(workout)).eq('id', id));
  unwrap(await supabase.from('workout_items').insert(workoutItemRows(id, workout.sets)));
  if (oldItemIds.length > 0) {
    unwrap(await supabase.from('workout_items').delete().in('id', oldItemIds));
  }
  return { id };
}

export async function deleteWorkout(id) {
  return unwrap(await supabase.from('workouts').delete().eq('id', id));
}

export async function fetchPlans() {
  const plans = unwrap(
    await supabase
      .from('plans')
      .select(
        'id, name, description, created_at, plan_items(id, position, target_sets, target_reps, target_weight_kg, target_duration_minutes, exercise:exercises(id, name, uses_weight))'
      )
      .order('created_at')
  );
  plans.forEach((plan) => plan.plan_items.sort(byPosition));
  return plans;
}

export async function fetchPlan(id) {
  const plan = unwrap(
    await supabase
      .from('plans')
      .select(
        'id, name, description, plan_items(id, position, target_sets, target_reps, target_weight_kg, target_duration_minutes, exercise:exercises(id, name, uses_weight))'
      )
      .eq('id', id)
      .maybeSingle()
  );
  if (plan) {
    plan.plan_items.sort(byPosition);
  }
  return plan;
}

function planItemRows(planId, items) {
  return items.map((item, index) => ({
    plan_id: planId,
    exercise_id: item.exerciseId,
    position: index + 1,
    target_sets: Number(item.targetSets),
    target_reps: emptyToNull(item.targetReps),
    target_weight_kg: emptyToNull(item.targetWeightKg),
    target_duration_minutes: emptyToNull(item.targetDurationMinutes)
  }));
}

export async function createPlan({ name, description, items }) {
  const created = unwrap(
    await supabase
      .from('plans')
      .insert({ user_id: getUser().id, name: name.trim(), description: textOrNull(description) })
      .select('id')
      .single()
  );
  if (items.length > 0) {
    try {
      unwrap(await supabase.from('plan_items').insert(planItemRows(created.id, items)));
    } catch (error) {
      await supabase.from('plans').delete().eq('id', created.id);
      throw error;
    }
  }
  return created;
}

export async function updatePlan(id, { name, description, items }, oldItemIds = []) {
  unwrap(await supabase.from('plans').update({ name: name.trim(), description: textOrNull(description) }).eq('id', id));
  if (items.length > 0) {
    unwrap(await supabase.from('plan_items').insert(planItemRows(id, items)));
  }
  if (oldItemIds.length > 0) {
    unwrap(await supabase.from('plan_items').delete().in('id', oldItemIds));
  }
  return { id };
}

export async function deletePlan(id) {
  return unwrap(await supabase.from('plans').delete().eq('id', id));
}

export async function fetchGoals() {
  return unwrap(
    await supabase
      .from('goals')
      .select('id, title, goal_type, target_value, unit, due_date, completed, created_at')
      .order('completed')
      .order('due_date', { ascending: true, nullsFirst: false })
  );
}

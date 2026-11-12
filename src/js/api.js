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

export async function deleteExercise(id) {
  return unwrap(await supabase.from('exercises').delete().eq('id', id));
}

export async function fetchWorkouts() {
  return unwrap(
    await supabase
      .from('workouts')
      .select('id, title, workout_date, notes, plan:plans(name), workout_items(count)')
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
  );
}

export async function fetchWorkout(id) {
  const workout = unwrap(
    await supabase
      .from('workouts')
      .select(
        'id, title, workout_date, notes, plan:plans(name), workout_items(id, set_number, repetitions, weight_kg, duration_minutes, exercise:exercises(id, name, uses_weight))'
      )
      .eq('id', id)
      .maybeSingle()
  );
  if (workout) {
    workout.workout_items.sort(bySetNumber);
  }
  return workout;
}

export async function fetchPlans() {
  const plans = unwrap(
    await supabase
      .from('plans')
      .select(
        'id, name, description, created_at, plan_items(id, position, target_sets, target_reps, target_weight_kg, target_duration_minutes, exercise:exercises(name))'
      )
      .order('created_at')
  );
  plans.forEach((plan) => plan.plan_items.sort(byPosition));
  return plans;
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

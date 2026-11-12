import { supabase } from './supabaseClient.js';

const state = {
  user: null,
  profile: null
};

export function getUser() {
  return state.user;
}

export function getProfile() {
  return state.profile;
}

export function getDisplayName() {
  return state.profile?.display_name ?? state.user?.email ?? '';
}

export async function loadSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  state.user = data.session?.user ?? null;
  await loadProfile();
  return state.user;
}

export async function loadProfile() {
  if (!state.user) {
    state.profile = null;
    return null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', state.user.id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  state.profile = data;
  return data;
}

export function setSessionUser(user) {
  state.user = user ?? null;
  if (!user) {
    state.profile = null;
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    throw error;
  }
  state.user = data.user;
  await loadProfile();
  return data;
}

export async function signUp({ displayName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { display_name: displayName.trim() },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`
    }
  });
  if (error) {
    throw error;
  }
  if (data.session) {
    state.user = data.user;
    await loadProfile();
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  state.user = null;
  state.profile = null;
  if (error) {
    throw error;
  }
}

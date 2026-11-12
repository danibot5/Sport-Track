import { createClient } from '@supabase/supabase-js';
import { isValidConfig, normalizeSupabaseUrl } from './config.js';

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

export const isConfigured = isValidConfig(url, key);

export const supabase = isConfigured ? createClient(url, key) : null;

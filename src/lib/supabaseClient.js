import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseAnonKey = 'SUA_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
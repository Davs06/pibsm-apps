import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Ambiente:', import.meta.env.MODE);
console.log('URL do Supabase configurada:', import.meta.env.VITE_SUPABASE_URL ? 'Sim' : 'Não');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Mantém o usuário logado ao atualizar a página
    autoRefreshToken: true,
  },
});

import { supabase } from '../lib/supabaseClient';

export const authService = {
  // Busca a sessão atual
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Escuta mudanças no estado (login/logout)
  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

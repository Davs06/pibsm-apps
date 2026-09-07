import { supabase } from '../lib/supabaseClient';

export const eventService = {
  // Buscar todos os eventos
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Criar um novo evento
  async createEvent(payload) {
    const { data, error } = await supabase.from('events').insert([payload]);

    if (error) throw error;
    return data;
  },

  // Atualizar um evento existente
  async updateEvent(id, payload) {
    const { error } = await supabase.from('events').update(payload).eq('id', id);

    if (error) throw error;
  },

  // Deletar um evento
  async deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;
  },
};

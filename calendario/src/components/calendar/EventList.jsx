import React from "react";
import { eventTypes } from "../../data/events";
import { Search, Edit2, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";

const EventList = ({
  events,
  year,
  month,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  user,
}) => {
  // FILTRAGEM: Filtra por mês/ano E pela pesquisa
  const filteredEvents = events.filter((e) => {
    const title = e.title || "";
    const typeLabel = eventTypes[e.type]?.label || "Evento";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const eventDate = new Date(e.date + "T00:00:00");
    const isCurrentMonth =
      eventDate.getMonth() === month && eventDate.getFullYear() === year;

    // Se estiver a pesquisar, ignora o mês para mostrar resultados globais
    // Se não estiver a pesquisar, mostra apenas o mês atual
    return searchTerm ? matchesSearch : isCurrentMonth && matchesSearch;
  });

  return (
    <div className="mt-12 bg-cream/30 dark:bg-dark/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-gold/10">
      <div className="mb-8">
        <div className="relative max-w-md mx-auto sm:mx-0">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 dark:text-cream/40">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar nesta lista..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-black/20 border border-dark/10 dark:border-white/10 text-dark dark:text-cream rounded-xl py-3 pl-12 pr-4 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-sm placeholder:text-dark/40 dark:placeholder:text-cream/40"
          />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark dark:text-cream flex items-center gap-2">
          {searchTerm ? (
            <>
              <Search size={20} className="text-gold" /> Resultados para: <span className="text-gold font-medium">{searchTerm}</span>
            </>
          ) : (
            <>
              <CalendarIcon size={20} className="text-gold" /> Eventos do Mês
            </>
          )}
        </h3>
        <span className="text-sm font-medium text-dark/50 dark:text-cream/50 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-dark/5 dark:border-white/5">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const typeConfig = eventTypes[event.type] || {
              label: "Evento",
              color: "#38b6ff",
            };
            return (
              <div
                key={event.id}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-white/5 rounded-xl border border-gold/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden gap-4"
              >
                {/* Linha colorida na lateral esquerda */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5" 
                  style={{ backgroundColor: typeConfig.color }}
                />
                
                <div className="flex flex-col pl-3 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: typeConfig.color }}
                    >
                      {typeConfig.label}
                    </span>
                    <span className="text-dark/60 dark:text-cream/60 text-sm font-medium flex items-center gap-1">
                      <CalendarIcon size={14} />
                      {new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                    {event.time && (
                      <span className="text-dark/60 dark:text-cream/60 text-sm font-medium flex items-center gap-1">
                        <Clock size={14} />
                        {event.time.substring(0, 5)}h
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-dark dark:text-cream">
                    {event.title || "Sem título"}
                  </span>
                </div>

                {user && (
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 justify-end border-t border-dark/5 dark:border-white/5 sm:border-0 pt-3 sm:pt-0">
                    <button
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors"
                      onClick={() => onEdit(event)}
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold transition-colors"
                      onClick={() => onDelete(event)}
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 dark:bg-white/5 rounded-xl border border-dashed border-dark/20 dark:border-white/20">
            <Search size={48} className="text-dark/20 dark:text-cream/20 mb-4" />
            <p className="text-lg font-medium text-dark/60 dark:text-cream/60">
              Nenhum evento encontrado.
            </p>
            {searchTerm && (
              <p className="text-sm text-dark/40 dark:text-cream/40 mt-1">
                Tente ajustar os seus termos de pesquisa.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;

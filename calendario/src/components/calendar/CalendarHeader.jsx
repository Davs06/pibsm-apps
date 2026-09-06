import React from "react";
import { useEvents } from "../../hooks/useEvents";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar as CalendarIcon } from "lucide-react";

const CalendarHeader = ({ month, year, onNavigate, onNewEvent, user }) => {
  const monthName = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const { refreshEvents } = useEvents();

  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-cream/70 dark:bg-dark/70 backdrop-blur-md p-5 rounded-2xl mb-8 border border-gold/20 shadow-sm gap-4 sticky top-20 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gold/10 text-gold rounded-xl">
          <CalendarIcon size={24} />
        </div>
        <h1 className="text-2xl font-extrabold text-dark dark:text-cream m-0 capitalize">
          {monthName[month]} <span className="text-gold">{year}</span>
        </h1>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-dark/5 dark:border-white/5 rounded-lg text-sm font-semibold text-dark/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" 
            onClick={() => refreshEvents()}
          >
            <RefreshCw size={16} /> <span className="hidden sm:inline">Atualizar</span>
          </button>
          
          {user && (
            <button 
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-dark rounded-lg text-sm font-bold transition-colors shadow-sm" 
              onClick={onNewEvent}
            >
              <Plus size={16} /> Novo
            </button>
          )}
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-white/5 p-1 rounded-xl border border-dark/5 dark:border-white/5 w-full sm:w-auto shadow-sm">
          <button 
            onClick={() => onNavigate("prev")}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-dark/70 dark:text-cream/70 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => onNavigate("today")}
            className="px-4 py-1.5 font-bold text-sm text-dark dark:text-cream hover:text-gold dark:hover:text-gold transition-colors"
          >
            Hoje
          </button>
          <button 
            onClick={() => onNavigate("next")}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-dark/70 dark:text-cream/70 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;

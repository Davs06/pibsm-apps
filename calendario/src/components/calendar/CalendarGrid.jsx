import React from 'react';
import { eventTypes } from '../../data/events';

const CalendarGrid = ({ year, month, events, onDayClick }) => {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const renderDates = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    // Preencher espaços vazios
    for (let i = 0; i < firstDay; i++) {
      dates.push(
        <div
          key={`empty-${i}`}
          className="bg-black/5 dark:bg-white/5 min-h-[60px] md:min-h-[120px] p-2"
        ></div>
      );
    }

    // Preencher dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayEvents = events
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
          const tA = parseInt((a.time || '23:59').replace(/[^0-9]/g, '').substring(0, 4));
          const tB = parseInt((b.time || '23:59').replace(/[^0-9]/g, '').substring(0, 4));
          return tA - tB;
        });

      // Se é o dia de hoje
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      dates.push(
        <div
          key={day}
          onClick={() => {
            // Em mobile (<= 768px), o clique num dia abre o modal com os eventos
            if (window.innerWidth <= 768 && dayEvents.length > 0) {
              onDayClick(dateStr, dayEvents);
            }
          }}
          className={`bg-cream dark:bg-dark min-h-[70px] md:min-h-[120px] p-1.5 md:p-2.5 flex flex-col transition-colors md:cursor-default ${dayEvents.length > 0 ? 'cursor-pointer active:bg-black/5 dark:active:bg-white/5 md:active:bg-transparent' : ''}`}
        >
          <span
            className={`text-[0.75rem] md:text-sm font-bold mb-1.5 md:mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-gold text-dark' : 'text-dark dark:text-cream'}`}
          >
            {day}
          </span>

          <div className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-1 mt-auto md:mt-0">
            {dayEvents.map((e, idx) => {
              const typeConfig = eventTypes[e.type] || { label: 'Evento', color: '#38b6ff' };

              return (
                <div
                  key={idx}
                  className="flex items-center md:px-2 md:py-1 rounded-full md:rounded-md text-white md:text-[0.7rem] font-medium"
                  style={{ backgroundColor: typeConfig.color }}
                  title={`${e.time ? e.time.substring(0, 5) + ' - ' : ''}${e.title}`}
                >
                  {/* Vista Desktop (Texto e Hora) */}
                  <div className="hidden md:flex items-center gap-1.5 w-full overflow-hidden">
                    {e.time && (
                      <span className="bg-black/20 px-1 rounded-sm text-[0.65rem] shrink-0">
                        {e.time.substring(0, 5)}
                      </span>
                    )}
                    <span className="truncate">{e.title}</span>
                  </div>

                  {/* Vista Mobile (Apenas um ponto colorido) */}
                  <div className="md:hidden w-2 h-2 rounded-full"></div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return dates;
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-7 gap-[1px] bg-dark/10 dark:bg-cream/10 border border-dark/10 dark:border-cream/10 rounded-xl overflow-hidden shadow-sm">
        {/* Cabeçalho dos dias da semana */}
        {weekDays.map((d) => (
          <div
            key={d}
            className="bg-white/80 dark:bg-black/40 py-3 text-center font-bold text-dark/70 dark:text-cream/70 text-xs md:text-sm uppercase tracking-wider"
          >
            {d}
          </div>
        ))}

        {/* Grelha de dias */}
        {renderDates()}
      </div>

      {/* Legenda de Cores */}
      <div className="mt-8 p-5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gold/20 shadow-sm">
        <h3 className="text-dark dark:text-cream text-lg font-bold mb-4">Legenda</h3>
        <div className="flex flex-wrap gap-4 md:gap-6">
          {Object.entries(eventTypes).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-sm shadow-sm"
                style={{ backgroundColor: value.color }}
              ></span>
              <span className="text-sm font-semibold text-dark/80 dark:text-cream/80">
                {value.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;

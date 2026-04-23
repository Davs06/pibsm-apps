import React from "react";
import { eventTypes } from "../../data/events"; // Certifica-te que este caminho está correto

const CalendarGrid = ({ year, month, events }) => {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const renderDates = () => {
    // 1. Descobrir qual o dia da semana do dia 1 do mês atual
    const firstDay = new Date(year, month, 1).getDay();

    // 2. Descobrir quantos dias tem o mês atual
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = [];

    // 3. Preencher os espaços vazios antes do dia 1 (ex: se o dia 1 for Quarta, deixa Dom, Seg e Ter vazios)
    for (let i = 0; i < firstDay; i++) {
      dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 4. Preencher os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      // Formatar a data para "YYYY-MM-DD" para comparar com a base de dados
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Filtrar e ordenar os eventos deste dia específico
      const dayEvents = events
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
          // Lógica segura de ordenação de horas (evita falhas se a hora for null)
          const tA = parseInt(
            (a.time || "23:59").replace(/[^0-9]/g, "").substring(0, 4),
          );
          const tB = parseInt(
            (b.time || "23:59").replace(/[^0-9]/g, "").substring(0, 4),
          );
          return tA - tB;
        });

      dates.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>

          <div className="events-container">
            {dayEvents.map((e, idx) => {
              // Pegar na cor definida no teu ficheiro de dados (fallback para azul se não existir)
              const typeConfig = eventTypes[e.type] || {
                label: "Evento",
                color: "#38b6ff",
              };

              return (
                <div
                  key={idx}
                  className="event-badge"
                  style={{ backgroundColor: typeConfig.color }}
                  title={`${e.time ? e.time.substring(0, 5) + " - " : ""}${e.title}`} // Tooltip ao passar o rato
                >
                  {e.time && (
                    <span className="event-time-tag">
                      {e.time.substring(0, 5)}
                    </span>
                  )}
                  <span className="event-title">{e.title}</span>
                </div>
              );
            })}
          </div>
        </div>,
      );
    }
    return dates;
  };

  return (
    <>
      <div className="calendar-grid">
        {/* Renderizar o cabeçalho dos dias da semana */}
        {weekDays.map((d) => (
          <div key={d} className="calendar-day-name">
            {d}
          </div>
        ))}

        {/* Renderizar a grelha de dias gerada acima */}
        {renderDates()}
      </div>

      {/* Secção da Legenda (Movida para aqui pois faz parte da visualização da grelha) */}
      <div className="legend-section">
        <h3 className="legend-title">Legenda de Cores</h3>
        <div className="legend-container">
          {Object.entries(eventTypes).map(([key, value]) => (
            <div key={key} className="legend-item">
              <span
                className="legend-circle"
                style={{ backgroundColor: value.color }}
              ></span>
              <span className="legend-label">{value.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CalendarGrid;

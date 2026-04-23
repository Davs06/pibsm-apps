// src/components/calendar/CalendarHeader.jsx
// import { refresh } from "netlify-identity-widget";
import React from "react";
import { useEvents } from "../../hooks/useEvents";

const CalendarHeader = ({ month, year, onNavigate, onNewEvent, user }) => {
  const monthName = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const { refreshEvents } = useEvents();

  return (
    <header className="calendar-header">
      <h1>
        {monthName[month]} {year}
      </h1>
      <div className="header-actions">
        <button className="btn-new-event" onClick={() => refreshEvents()}>
          Atualzar Calendário
        </button>
        {user && (
          <button className="btn-new-event" onClick={onNewEvent}>
            + Novo Evento
          </button>
        )}
        <div className="month-navigation">
          <button onClick={() => onNavigate("prev")}>←</button>
          <button onClick={() => onNavigate("today")}>Hoje</button>
          <button onClick={() => onNavigate("next")}>→</button>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;

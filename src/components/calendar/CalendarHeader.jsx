// src/components/calendar/CalendarHeader.jsx
import React from "react";

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
  return (
    <header className="calendar-header">
      <h1>
        {monthName[month]} {year}
      </h1>
      <div className="header-actions">
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

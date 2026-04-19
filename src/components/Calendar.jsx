import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import "./Calendar.css";
import { events as initialEvents } from "../data/events";

const Calendar = () => {
  // Alteração: Inicia com a data atual em vez de janeiro de 2026
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);

  useEffect(() => {
    netlifyIdentity.init();
    // Atualiza o estado do usuário quando logar ou deslogar
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);

    netlifyIdentity.on("login", (user) => {
      setUser(user);
      netlifyIdentity.close();
    });
    netlifyIdentity.on("logout", () => setUser(null));
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth(year, month); i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="calendar-day empty"></div>,
    );
  }

  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const hasEvent = initialEvents.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === d &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });

    calendarDays.push(
      <div key={d} className={`calendar-day ${hasEvent ? "event" : ""}`}>
        {d}
      </div>,
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        <div className="weekday">Dom</div>
        <div className="weekday">Seg</div>
        <div className="weekday">Ter</div>
        <div className="weekday">Qua</div>
        <div className="weekday">Qui</div>
        <div className="weekday">Sex</div>
        <div className="weekday">Sáb</div>
        {calendarDays}
      </div>

      <div className="events-list">
        <h3>Todos os Eventos do Mês</h3>
        {initialEvents
          .filter((event) => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getMonth() === month && eventDate.getFullYear() === year
            );
          })
          .map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-info">
                <strong>
                  {new Date(event.date).toLocaleDateString("pt-BR")}
                </strong>{" "}
                - {event.title}
              </div>
              {/* Alteração: Apenas usuários logados podem ver Editar e Excluir */}
              {user && (
                <div className="event-actions">
                  <Link to={`/event/${event.id}`} className="btn-edit">
                    Editar
                  </Link>
                  <Link to={`/event/${event.id}/delete`} className="btn-delete">
                    Excluir
                  </Link>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Calendar;

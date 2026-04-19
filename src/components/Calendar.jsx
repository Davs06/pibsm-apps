import { useState, useEffect } from "react";
import { events, eventTypes } from "../data/events";
import { Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import "./Calendar.css";

const Calendar = () => {
  // Inicia na data atual do sistema
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);

  useEffect(() => {
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    netlifyIdentity.on("login", (u) => {
      setUser(u);
      netlifyIdentity.close();
    });
    netlifyIdentity.on("logout", () => setUser(null));
  }, []);

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

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => {
      if (event.endDate)
        return event.date <= dateStr && event.endDate >= dateStr;
      return event.date === dateStr;
    });
  };

  const renderDates = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let i = 0; i < firstDay; i++) {
      dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      dates.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>
          <div className="events-container">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className="event-badge"
                style={{
                  backgroundColor: eventTypes[event.type]?.color || "#666",
                }}
              >
                {event.time && <span className="event-time">{event.time}</span>}
                <span className="event-title">{event.title}</span>
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return dates;
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>Calendário PIB - {year}</h1>
        <div className="month-navigation">
          <button onClick={prevMonth}>← Anterior</button>
          <h2>{monthNames[month]}</h2>
          <button onClick={nextMonth}>Próximo →</button>
        </div>
      </header>

      <div className="calendar-grid">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="calendar-day-name">
            {d}
          </div>
        ))}
        {renderDates()}
      </div>

      <div className="legend">
        <h3>Legenda</h3>
        <div className="legend-items">
          {Object.entries(eventTypes).map(([key, value]) => (
            <div key={key} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: value.color }}
              ></span>
              <span>{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="all-events">
        <h3>Todos os Eventos do Mês</h3>
        <div className="events-list">
          {events
            .filter(
              (e) =>
                new Date(e.date).getMonth() === month &&
                new Date(e.date).getFullYear() === year,
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-item-header">
                  <span
                    className="event-item-type"
                    style={{ backgroundColor: eventTypes[event.type]?.color }}
                  >
                    {eventTypes[event.type]?.label}
                  </span>
                  <span className="event-item-date">
                    {new Date(event.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="event-item-actions">
                  <span className="event-item-title">{event.title}</span>
                  {user && (
                    <div className="event-actions">
                      <Link to={`/event/${event.id}`} className="btn-edit">
                        Editar
                      </Link>
                      <Link
                        to={`/event/${event.id}/delete`}
                        className="btn-delete"
                      >
                        Excluir
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

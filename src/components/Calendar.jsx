import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import { supabase } from "../lib/supabaseClient";
import { events as jsonEvents, eventTypes } from "../data/events";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    netlifyIdentity.on("login", (u) => {
      setUser(u);
      netlifyIdentity.close();
    });
    netlifyIdentity.on("logout", () => setUser(null));
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase.from("events").select("*");
        if (!error && data && data.length > 0) {
          setEvents(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Usando JSON local.");
      }
    }
    setEvents(jsonEvents);
    setLoading(false);
  };

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

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => {
      const eDate = event.date || event.startDate;
      const eEnd = event.end_date || event.endDate;
      if (eEnd) return eDate <= dateStr && eEnd >= dateStr;
      return eDate === dateStr;
    });
  };

  const renderDates = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let i = 0; i < firstDay; i++)
      dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      dates.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>
          <div className="events-container">
            {dayEvents.map((e, i) => (
              <div
                key={i}
                className="event-badge"
                style={{ backgroundColor: eventTypes[e.type]?.color || "#666" }}
              >
                <span className="event-title">{e.title}</span>
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
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            ←
          </button>
          <h2>{monthNames[month]}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            →
          </button>
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
          {Object.entries(eventTypes).map(([k, v]) => (
            <div key={k} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: v.color }}
              ></span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="all-events">
        <h3>Lista de Eventos - {monthNames[month]}</h3>
        <div className="events-list">
          {events
            .filter((e) => new Date(e.date).getMonth() === month)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-item-info">
                  <span
                    className="event-tag"
                    style={{ backgroundColor: eventTypes[event.type]?.color }}
                  >
                    {eventTypes[event.type]?.label}
                  </span>
                  <div className="event-text-content">
                    <span className="event-date-display">
                      {new Date(event.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="event-title-text">{event.title}</span>
                  </div>
                </div>
                {user && (
                  <div className="event-item-actions">
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
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

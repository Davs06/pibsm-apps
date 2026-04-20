import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import { supabase } from "../lib/supabaseClient";
import { events as jsonEvents, eventTypes } from "../data/events";
import "./Calendar.css";

const Calendar = () => {
  // 1. Inicia sempre na data atual do sistema
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa Netlify Identity
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    netlifyIdentity.on("login", (u) => {
      setUser(u);
      netlifyIdentity.close();
    });
    netlifyIdentity.on("logout", () => setUser(null));

    // Carrega os dados (Supabase em Dev / JSON em Prod)
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    setLoading(true);

    // Tenta carregar do Supabase se o client existir (Ambiente Dev)
    if (supabase) {
      try {
        const { data, error } = await supabase.from("events").select("*");

        if (!error && data && data.length > 0) {
          setEvents(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase não disponível, usando JSON.");
      }
    }

    // Fallback: Usa o JSON se estiver em Prod ou se o banco estiver vazio/erro
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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => {
      if (event.end_date)
        return event.date <= dateStr && event.end_date >= dateStr;
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
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                className="event-badge"
                style={{
                  backgroundColor: eventTypes[event.type]?.color || "#666",
                }}
                title={event.title}
              >
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
        {loading ? (
          <div className="loading-spinner">Carregando...</div>
        ) : (
          renderDates()
        )}
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
        <h3>Eventos de {monthNames[month]}</h3>
        <div className="events-list">
          {events
            .filter((e) => {
              const d = new Date(e.date);
              return d.getMonth() === month && d.getFullYear() === year;
            })
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
                  <strong>
                    {new Date(event.date).toLocaleDateString("pt-BR")}
                  </strong>
                  <span className="event-title-text">{event.title}</span>
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

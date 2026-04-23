import React, { useState, useEffect } from "react";
import { eventService } from "../services/eventService"; // 1. Importamos o serviço
import { eventTypes } from "../data/events";
import "./WeeklyView.css";

// 2. Recebemos o user via props (mesmo que não usemos na tela, padroniza a rota)
const WeeklyView = () => {
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyEvents = async () => {
      setLoading(true);

      try {
        // 3. Usamos a Camada de Serviço em vez do Supabase direto
        const data = await eventService.getEvents();

        // 4. Calculamos o intervalo da semana (hoje até daqui a 7 dias)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // 5. Filtramos os eventos para mostrar apenas os dos próximos 7 dias
        const filteredEvents = data.filter((event) => {
          const eventDate = new Date(event.date + "T00:00:00");
          return eventDate >= today && eventDate <= nextWeek;
        });

        setWeeklyEvents(filteredEvents);
      } catch (error) {
        console.error("Erro ao carregar agenda da semana:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyEvents();
  }, []);

  if (loading)
    return (
      <div className="loading-wrapper">
        <div className="loading-content">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <p>Carregando agenda da semana...</p>
        </div>
      </div>
    );

  return (
    <div className="weekly-container">
      <header className="weekly-header">
        <h1 style={{ color: "#38b6ff" }}>Agenda da Semana</h1>
        <p>Confira as atividades da nossa igreja nos próximos 7 dias</p>
      </header>

      <div className="weekly-list">
        {weeklyEvents.length > 0 ? (
          weeklyEvents.map((event) => {
            const config = eventTypes[event.type] || eventTypes["event"];
            const eventDate = new Date(event.date + "T00:00:00");

            return (
              <div
                key={event.id}
                className="weekly-card"
                style={{ borderLeftColor: config.color }}
              >
                <div className="weekly-date-box">
                  <span className="weekly-day">{eventDate.getDate()}</span>
                  <span className="weekly-month">
                    {eventDate
                      .toLocaleDateString("pt-BR", { month: "short" })
                      .toUpperCase()}
                  </span>
                </div>

                <div className="weekly-info">
                  <div className="weekly-top">
                    <span className="weekly-weekday">
                      {eventDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                      })}
                    </span>
                    <span className="weekly-time">
                      {event.time?.substring(0, 5)}h
                    </span>
                  </div>
                  <h3 className="weekly-title">{event.title}</h3>
                  <span
                    className="weekly-category"
                    style={{ color: config.color }}
                  >
                    ● {config.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events-weekly">
            Nenhum evento programado para esta semana.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyView;

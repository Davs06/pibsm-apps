import React from 'react';
import { useEvents } from '../hooks/useEvents'; // 1. Importamos o nosso Hook
import { eventTypes } from '../data/events';
import './WeeklyView.css';

const WeeklyView = () => {
  // 2. Usamos o Hook! Pegamos apenas o loading e a função de calcular a semana
  const { loading, getWeeklyEvents } = useEvents();

  // 3. Executamos a função para ter a lista pronta
  const weeklyEvents = getWeeklyEvents();

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
        <h1 style={{ color: '#38b6ff' }}>Agenda da Semana</h1>
        <p>Confira as atividades da nossa igreja nos próximos 7 dias</p>
      </header>

      <div className="weekly-list">
        {weeklyEvents.length > 0 ? (
          weeklyEvents.map((event) => {
            const config = eventTypes[event.type] || eventTypes['event'];
            const eventDate = new Date(event.date + 'T00:00:00');

            return (
              <div key={event.id} className="weekly-card" style={{ borderLeftColor: config.color }}>
                <div className="weekly-date-box">
                  <span className="weekly-day">{eventDate.getDate()}</span>
                  <span className="weekly-month">
                    {eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </span>
                </div>

                <div className="weekly-info">
                  <div className="weekly-top">
                    <span className="weekly-weekday">
                      {eventDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                      })}
                    </span>
                    <span className="weekly-time">{event.time?.substring(0, 5)}h</span>
                  </div>
                  <h3 className="weekly-title">{event.title}</h3>
                  <span className="weekly-category" style={{ color: config.color }}>
                    ● {config.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events-weekly">Nenhum evento programado para esta semana.</div>
        )}
      </div>
    </div>
  );
};

export default WeeklyView;

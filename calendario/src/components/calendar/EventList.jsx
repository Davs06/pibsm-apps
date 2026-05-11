import React from "react";
import { eventTypes } from "../../data/events";

const EventList = ({
  events,
  year,
  month,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  user,
}) => {
  // FILTRAGEM: Filtra por mês/ano E pela pesquisa
  const filteredEvents = events.filter((e) => {
    const title = e.title || "";
    const typeLabel = eventTypes[e.type]?.label || "Evento";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const eventDate = new Date(e.date + "T00:00:00");
    const isCurrentMonth =
      eventDate.getMonth() === month && eventDate.getFullYear() === year;

    // Se estiver a pesquisar, ignora o mês para mostrar resultados globais
    // Se não estiver a pesquisar, mostra apenas o mês atual
    return searchTerm ? matchesSearch : isCurrentMonth && matchesSearch;
  });

  return (
    <div className="all-events-section">
      <div className="list-search-wrapper">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Pesquisar nesta lista..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="list-search-input"
          />
        </div>
      </div>

      <div className="all-events">
        <h3>
          {searchTerm ? `Resultados para: ${searchTerm}` : `Eventos do Mês`}
        </h3>
        <div className="events-list">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const typeConfig = eventTypes[event.type] || {
                label: "Evento",
                color: "#38b6ff",
              };
              return (
                <div
                  key={event.id}
                  className="event-list-item"
                  style={{ borderLeft: `5px solid ${typeConfig.color}` }}
                >
                  <div className="event-info-main">
                    <div className="event-details">
                      <span className="event-date">
                        {new Date(event.date + "T00:00:00").toLocaleDateString(
                          "pt-BR",
                        )}
                        {event.time ? ` às ${event.time.substring(0, 5)}h` : ""}
                      </span>
                      <span className="event-title-text">
                        {event.title || "Sem título"}
                      </span>
                      <span
                        className="event-type-badge"
                        style={{ color: typeConfig.color }}
                      >
                        ● {typeConfig.label}
                      </span>
                    </div>
                  </div>
                  {user && (
                    <div className="event-actions">
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(event)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => onDelete(event)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="no-events-msg">Nenhum evento encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;

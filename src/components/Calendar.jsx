import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { eventTypes } from "../data/events";
import Modal from "./Modal";
import "./Calendar.css";
import toast from "react-hot-toast";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "create",
    eventData: { title: "", date: "", time: "", type: "" },
  });

  useEffect(() => {
    // Sincroniza utilizador com Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    loadCalendarData();

    return () => subscription.unsubscribe();
  }, []);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true }); // Ordenação primária no banco

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      toast.error("Erro ao carregar dados do banco.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { eventData, mode } = modalConfig;
    const payload = {
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      type: eventData.type,
    };

    try {
      if (mode === "create") {
        const { error } = await supabase.from("events").insert([payload]);
        if (error) throw error;
      } else if (mode === "edit") {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", eventData.id);
        if (error) throw error;
      }
      setModalConfig({ ...modalConfig, isOpen: false });
      loadCalendarData();
    } catch (err) {
      alert("Erro na operação: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", modalConfig.eventData.id);
      if (error) throw error;

      setModalConfig({ ...modalConfig, isOpen: false });
      loadCalendarData();

      toast.success("Evento excluído com sucesso!"); // Substitui o alert
    } catch (err) {
      toast.error("Erro ao eliminar: " + err.message); // Substitui o alert
    }
  };

  // Funções de navegação e renderização (Mantenha as mesmas do código anterior)
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
    return events.filter((e) => e.date === dateStr);
  };

  const renderDates = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let i = 0; i < firstDay; i++) {
      dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Filtra e ordena
      const dayEvents = events
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
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
              const typeConfig = eventTypes[e.type] || eventTypes["event"];
              return (
                <div
                  key={idx}
                  className="event-badge"
                  style={{ backgroundColor: typeConfig.color }}
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
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>Calendário PIB - {year}</h1>
        <div className="header-actions">
          {user && (
            <button
              className="btn-new-event"
              onClick={() =>
                setModalConfig({
                  isOpen: true,
                  mode: "create",
                  eventData: {
                    title: "",
                    date: new Date().toISOString().split("T")[0],
                    time: "",
                    type: "culto",
                  },
                })
              }
            >
              + Novo Evento
            </button>
          )}
          <div className="month-navigation">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            >
              ←
            </button>
            <h2>{monthNames[month]}</h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            >
              →
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loading-wrapper">
          <div className="loading-content">
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
            <p>Carregando calendário...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="calendar-grid">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="calendar-day-name">
                {d}
              </div>
            ))}
            {renderDates()}
          </div>

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
          {/* BARRA DE PESQUISA */}
          <div className="list-search-wrapper">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="list-search-input"
              />
            </div>
          </div>

          {/* LISTA DE EVENTOS COM FILTROS SEGUROS */}
          <div className="all-events">
            <h3>
              {searchTerm ? `Resultados para: ${searchTerm}` : `Eventos do Mês`}
            </h3>
            <div className="events-list">
              {events &&
                events
                  .filter((e) => {
                    // Evita erro de .toLowerCase() em campos nulos
                    const title = e.title || "";
                    const typeLabel = eventTypes[e.type]?.label || "Evento";

                    const matchesSearch =
                      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      typeLabel
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());

                    const eventDate = new Date(e.date + "T00:00:00");
                    const isCurrentMonth =
                      eventDate.getMonth() === month &&
                      eventDate.getFullYear() === year;

                    // Se estiver pesquisando, mostra todos os resultados. Se não, filtra por mês.
                    return searchTerm
                      ? matchesSearch
                      : isCurrentMonth && matchesSearch;
                  })
                  .map((event) => {
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
                              {new Date(
                                event.date + "T00:00:00",
                              ).toLocaleDateString("pt-BR")}
                              {event.time
                                ? ` às ${event.time.substring(0, 5)}h`
                                : ""}
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
                              onClick={() => handleEdit(event)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(event.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* <div className="all-events">
            <h3>Eventos de {monthNames[month]}</h3>
            <div className="events-list">
              {events
                .filter((e) => {
                  const eventDate = new Date(e.date + "T00:00:00");
                  return (
                    eventDate.getMonth() === month &&
                    eventDate.getFullYear() === year
                  );
                })
                .sort((a, b) => {
                  // Ordenação por data primeiro
                  if (a.date !== b.date) return a.date.localeCompare(b.date);
                  // Ordenação numérica por hora para desempatar o mesmo dia
                  const tA = parseInt(
                    (a.time || "23:59").replace(/[^0-9]/g, "").substring(0, 4),
                  );
                  const tB = parseInt(
                    (b.time || "23:59").replace(/[^0-9]/g, "").substring(0, 4),
                  );
                  return tA - tB;
                })
                .map((event) => {
                  const typeConfig =
                    eventTypes[event.type] || eventTypes["event"];
                  return (
                    <div key={event.id} className="event-list-item">
                      <div className="event-info-main">
                        <span
                          className="event-type-tag"
                          style={{ backgroundColor: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </span>
                        <div className="event-details">
                          <span className="event-date">
                            {new Date(
                              event.date + "T00:00:00",
                            ).toLocaleDateString("pt-BR")}
                            {event.time && ` às ${event.time.substring(0, 5)}h`}
                          </span>
                          <span className="event-title-text">
                            {event.title}
                          </span>
                        </div>
                      </div>
                      {user && (
                        <div className="event-actions">
                          <button
                            className="btn-edit"
                            onClick={() =>
                              setModalConfig({
                                isOpen: true,
                                mode: "edit",
                                eventData: event,
                              })
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() =>
                              setModalConfig({
                                isOpen: true,
                                mode: "delete",
                                eventData: event,
                              })
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div> */}
        </>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={
          modalConfig.mode === "create"
            ? "Novo Evento"
            : modalConfig.mode === "edit"
              ? "Editar Evento"
              : "Confirmar Exclusão"
        }
      >
        {modalConfig.mode === "delete" ? (
          <div className="delete-confirmation">
            <p>
              Deseja excluir <strong>{modalConfig.eventData.title}</strong>?
            </p>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
              >
                Cancelar
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                required
                value={modalConfig.eventData.title}
                onChange={(e) =>
                  setModalConfig({
                    ...modalConfig,
                    eventData: {
                      ...modalConfig.eventData,
                      title: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                required
                value={modalConfig.eventData.date}
                onChange={(e) =>
                  setModalConfig({
                    ...modalConfig,
                    eventData: {
                      ...modalConfig.eventData,
                      date: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Horário</label>
              <input
                type="time"
                required
                className="light-input"
                value={modalConfig.eventData.time || ""}
                onChange={(e) =>
                  setModalConfig({
                    ...modalConfig,
                    eventData: {
                      ...modalConfig.eventData,
                      time: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                value={modalConfig.eventData.type}
                onChange={(e) =>
                  setModalConfig({
                    ...modalConfig,
                    eventData: {
                      ...modalConfig.eventData,
                      type: e.target.value,
                    },
                  })
                }
              >
                {Object.entries(eventTypes).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                Salvar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;

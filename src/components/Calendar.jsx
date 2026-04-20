import React, { useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import { supabase } from "../lib/supabaseClient";
import { eventTypes } from "../data/events"; // Mantemos apenas os tipos/cores para a legenda
import Modal from "./Modal";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "create",
    eventData: { title: "", date: "", type: "event" },
  });

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

  // Busca EXCLUSIVA do Banco de Dados
  const loadCalendarData = async () => {
    setLoading(true);
    if (!supabase) {
      console.error("Supabase não configurado.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Erro ao carregar eventos do banco:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalConfig({
      isOpen: true,
      mode: "create",
      eventData: {
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "event",
      },
    });
  };

  const openEditModal = (event) => {
    setModalConfig({
      isOpen: true,
      mode: "edit",
      eventData: { ...event },
    });
  };

  const openDeleteModal = (event) => {
    setModalConfig({
      isOpen: true,
      mode: "delete",
      eventData: event,
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { eventData, mode } = modalConfig;

    try {
      if (mode === "create") {
        const { error } = await supabase.from("events").insert([eventData]);
        if (error) throw error;
      } else if (mode === "edit") {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", eventData.id);
        if (error) throw error;
      }
      closeModal();
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
      closeModal();
      loadCalendarData();
    } catch (err) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

  // Lógica de Renderização do Calendário
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
      const dayEvents = getEventsForDay(day);
      dates.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>
          <div className="events-container">
            {dayEvents.map((e, idx) => (
              <div
                key={idx}
                className="event-badge"
                style={{ backgroundColor: eventTypes[e.type]?.color }}
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
        <div className="header-actions">
          {user && (
            <button className="btn-new-event" onClick={openCreateModal}>
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
        <div className="loading-state">Carregando eventos...</div>
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
                .filter((e) => new Date(e.date).getUTCMonth() === month)
                .map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-item-info">
                      <span
                        className="event-tag"
                        style={{
                          backgroundColor: eventTypes[event.type]?.color,
                        }}
                      >
                        {eventTypes[event.type]?.label}
                      </span>
                      <div className="event-text-content">
                        <span className="event-date-display">
                          {new Date(event.date).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}
                        </span>
                        <span className="event-title-text">{event.title}</span>
                      </div>
                    </div>
                    {user && (
                      <div className="event-item-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(event)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => openDeleteModal(event)}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={
          modalConfig.mode === "create"
            ? "Novo Evento"
            : modalConfig.mode === "edit"
              ? "Editar Evento"
              : "Excluir Evento"
        }
      >
        {modalConfig.mode === "delete" ? (
          <div className="delete-confirmation">
            <p>
              Deseja realmente excluir{" "}
              <strong>{modalConfig.eventData.title}</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
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
              <button type="button" className="btn-cancel" onClick={closeModal}>
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

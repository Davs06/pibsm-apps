import React, { useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import { supabase } from "../lib/supabaseClient";
import { events as jsonEvents, eventTypes } from "../data/events";
import Modal from "./Modal";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "create", // 'create', 'edit' ou 'delete'
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

  // Funções de Gestão do Modal
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

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // Submissão do Formulário (Criar e Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Erro: Supabase não configurado.");

    const { eventData, mode } = modalConfig;

    if (mode === "create") {
      const { error } = await supabase.from("events").insert([eventData]);
      if (error) alert("Erro ao criar: " + error.message);
    } else if (mode === "edit") {
      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", eventData.id);
      if (error) alert("Erro ao atualizar: " + error.message);
    }

    closeModal();
    loadCalendarData();
  };

  const handleDelete = async () => {
    if (!supabase) return;
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", modalConfig.eventData.id);
    if (error) alert("Erro ao eliminar: " + error.message);
    closeModal();
    loadCalendarData();
  };

  // Lógica do Calendário
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
    return events.filter((e) => (e.date || e.startDate) === dateStr);
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
          {/* Botão padronizado conforme solicitado */}
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

      {/* MODAL REUTILIZÁVEL */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
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
              Tem certeza que deseja excluir o evento{" "}
              <strong>{modalConfig.eventData.title}</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Confirmar Exclusão
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
              <label>Tipo</label>
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

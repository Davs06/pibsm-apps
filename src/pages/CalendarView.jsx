import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { eventTypes } from "../data/events";
import Modal from "../components/Modal";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarGrid from "../components/calendar/CalendarGrid";
import EventList from "../components/calendar/EventList";
import "../pages/Calendar.css";
import toast from "react-hot-toast";
import { eventService } from "../services/eventService";

const Calendar = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "create",
    eventData: { title: "", date: "", time: "", type: "culto" },
  });

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents(); // Simples assim!
      setEvents(data);
    } catch (err) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE NEGÓCIO (HANDLERS) ---

  const handleNavigation = (action) => {
    if (action === "prev") setCurrentDate(new Date(year, month - 1, 1));
    else if (action === "next") setCurrentDate(new Date(year, month + 1, 1));
    else if (action === "today") setCurrentDate(new Date());
  };

  const handleEdit = (event) => {
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

  // Deletar
  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(modalConfig.eventData.id);
      setModalConfig({ ...modalConfig, isOpen: false });
      loadCalendarData();
      toast.success("Evento excluído!");
    } catch (err) {
      toast.error("Erro ao eliminar.");
    }
  };

  // Criar/Editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { eventData, mode } = modalConfig;
    const payload = {
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      type: eventData.type,
    };

    try {
      if (mode === "create") {
        await eventService.createEvent(payload);
      } else {
        await eventService.updateEvent(eventData.id, payload);
      }
      setModalConfig({ ...modalConfig, isOpen: false });
      loadCalendarData();
      toast.success("Sucesso!");
    } catch (err) {
      toast.error("Erro na operação.");
    }
  };

  if (loading)
    return (
      <div className="loading-wrapper">
        <div className="loading-content">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <p>A carregar calendário...</p>
        </div>
      </div>
    );

  return (
    <div className="calendar-container">
      <CalendarHeader
        month={month}
        year={year}
        currentDate={currentDate}
        user={user}
        onNavigate={handleNavigation}
        onNewEvent={() =>
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
      />

      <CalendarGrid year={year} month={month} events={events} />

      <EventList
        events={events}
        year={year}
        month={month}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
        user={user}
      />

      {/* O Modal permanece aqui para ter acesso fácil ao handleSubmit */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
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
                {modalConfig.mode === "create" ? "Criar" : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;

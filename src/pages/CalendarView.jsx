import React, { useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { eventService } from "../services/eventService";
import { eventTypes } from "../data/events";
import Modal from "../components/Modal";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarGrid from "../components/calendar/CalendarGrid";
import EventList from "../components/calendar/EventList";
import "../pages/Calendar.css";
import toast from "react-hot-toast";

const Calendar = ({ user }) => {
  const { events, loading, fetchEvents } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Estado inicial do modal bem definido para evitar erros de undefined
  const initialModalState = {
    isOpen: false,
    mode: "create",
    eventData: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      type: "culto",
    },
  };

  const [modalConfig, setModalConfig] = useState(initialModalState);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // --- NAVEGAÇÃO ---
  const handleNavigation = (action) => {
    if (action === "prev") setCurrentDate(new Date(year, month - 1, 1));
    else if (action === "next") setCurrentDate(new Date(year, month + 1, 1));
    else if (action === "today") setCurrentDate(new Date());
  };

  // --- PREPARAÇÃO DE MODAIS ---
  const handleEdit = (event) => {
    setModalConfig({
      isOpen: true,
      mode: "edit",
      eventData: { ...event }, // O ID vem aqui automaticamente
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

  // --- OPERAÇÕES NO BANCO ---
  // Deletar
  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(modalConfig.eventData.id);
      closeModal();
      fetchEvents();
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
      closeModal();
      fetchEvents();
      toast.success(mode === "create" ? "Criado com sucesso!" : "Atualizado!");
    } catch (err) {
      toast.error("Erro na operação.");
    }
  };

  // Função auxiliar para atualizar campos do formulário sem repetir código
  const handleInputChange = (field, value) => {
    setModalConfig((prev) => ({
      ...prev,
      eventData: { ...prev.eventData, [field]: value },
    }));
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
            eventData: initialModalState.eventData,
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
              Deseja excluir <strong>{modalConfig.eventData.title}</strong>?
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
                placeholder="Ex: Culto de Celebração"
                value={modalConfig.eventData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                required
                value={modalConfig.eventData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Horário</label>
              <input
                type="time"
                required
                value={modalConfig.eventData.time || ""}
                onChange={(e) => handleInputChange("time", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select
                value={modalConfig.eventData.type || "culto"}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                {Object.entries(eventTypes).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeModal}>
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {modalConfig.mode === "create"
                  ? "Criar Evento"
                  : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;

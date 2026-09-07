import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { eventService } from '../services/eventService';
import { eventTypes } from '../data/events';
import Modal from '../components/Modal';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EventList from '../components/calendar/EventList';
import DayEventsModal from '../components/calendar/DayEventsModal';
import toast from 'react-hot-toast';

const Calendar = ({ user }) => {
  const { events, loading, createEvent, updateEvent } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para o Modal Mobile de Eventos do Dia
  const [mobileModalConfig, setMobileModalConfig] = useState({
    isOpen: false,
    dateStr: '',
    events: [],
  });

  const handleDayClick = (dateStr, dayEvents) => {
    setMobileModalConfig({
      isOpen: true,
      dateStr,
      events: dayEvents,
    });
  };

  // Estado inicial do modal de CRUD
  const initialModalState = {
    isOpen: false,
    mode: 'create',
    eventData: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      type: 'culto',
    },
  };

  const [modalConfig, setModalConfig] = useState(initialModalState);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // --- NAVEGAÇÃO ---
  const handleNavigation = (action) => {
    if (action === 'prev') setCurrentDate(new Date(year, month - 1, 1));
    else if (action === 'next') setCurrentDate(new Date(year, month + 1, 1));
    else if (action === 'today') setCurrentDate(new Date());
  };

  // --- PREPARAÇÃO DE MODAIS CRUD ---
  const handleEdit = (event) => {
    setModalConfig({
      isOpen: true,
      mode: 'edit',
      eventData: { ...event },
    });
  };

  const openDeleteModal = (event) => {
    setModalConfig({
      isOpen: true,
      mode: 'delete',
      eventData: event,
    });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // --- OPERAÇÕES NO BANCO ---
  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(modalConfig.eventData.id);
      closeModal();
      toast.success('Evento excluído!');
    } catch (err) {
      console.error('🚨 ERRO DETALHADO AO DELETAR:', err);
      toast.error('Erro ao eliminar.');
    }
  };

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
      if (mode === 'create') {
        await createEvent(payload);
      } else {
        await updateEvent({ id: eventData.id, payload });
      }
      closeModal();
      toast.success(mode === 'create' ? 'Criado com sucesso!' : 'Atualizado!');
    } catch {
      toast.error('Erro ao encerrar sessão');
    }
  };

  const handleInputChange = (field, value) => {
    setModalConfig((prev) => ({
      ...prev,
      eventData: { ...prev.eventData, [field]: value },
    }));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gold rounded-full opacity-60 animate-ping"></div>
          <div
            className="absolute inset-0 bg-gold rounded-full opacity-60 animate-ping"
            style={{ animationDelay: '-0.5s' }}
          ></div>
        </div>
        <p className="text-gold font-bold text-lg tracking-wide animate-pulse">
          A carregar calendário...
        </p>
      </div>
    );

  return (
    <div className="w-full">
      <CalendarHeader
        month={month}
        year={year}
        currentDate={currentDate}
        user={user}
        onNavigate={handleNavigation}
        onNewEvent={() =>
          setModalConfig({
            isOpen: true,
            mode: 'create',
            eventData: initialModalState.eventData,
          })
        }
      />

      <CalendarGrid year={year} month={month} events={events} onDayClick={handleDayClick} />

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

      {/* NOVO MODAL: MOBILE DAY EVENTS */}
      <DayEventsModal
        isOpen={mobileModalConfig.isOpen}
        onClose={() => setMobileModalConfig((prev) => ({ ...prev, isOpen: false }))}
        date={mobileModalConfig.dateStr}
        events={mobileModalConfig.events}
      />

      {/* MODAL CRUD */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={
          modalConfig.mode === 'create'
            ? 'Novo Evento'
            : modalConfig.mode === 'edit'
              ? 'Editar Evento'
              : 'Excluir Evento'
        }
      >
        {modalConfig.mode === 'delete' ? (
          <div className="flex flex-col gap-6">
            <p className="text-dark dark:text-cream text-lg text-center">
              Deseja excluir <strong className="text-red-500">{modalConfig.eventData.title}</strong>
              ?
            </p>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-dark/10 dark:border-white/10">
              <button
                className="px-5 py-2.5 rounded-xl font-semibold text-dark/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                onClick={handleDelete}
              >
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-dark/70 dark:text-cream/70">Título</label>
              <input
                type="text"
                required
                placeholder="Ex: Culto de Celebração"
                value={modalConfig.eventData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-dark/10 dark:border-white/10 text-dark dark:text-cream rounded-xl px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-dark/40 dark:placeholder:text-cream/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-dark/70 dark:text-cream/70">Data</label>
              <input
                type="date"
                required
                value={modalConfig.eventData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-dark/10 dark:border-white/10 text-dark dark:text-cream rounded-xl px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-dark/70 dark:text-cream/70">Horário</label>
              <input
                type="time"
                required
                value={modalConfig.eventData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-dark/10 dark:border-white/10 text-dark dark:text-cream rounded-xl px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-dark/70 dark:text-cream/70">Categoria</label>
              <select
                value={modalConfig.eventData.type || 'culto'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-dark/10 dark:border-white/10 text-dark dark:text-cream rounded-xl px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all appearance-none"
              >
                {Object.entries(eventTypes).map(([key, value]) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-cream dark:bg-dark text-dark dark:text-cream"
                  >
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark/10 dark:border-white/10">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-semibold text-dark/70 dark:text-cream/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-semibold bg-gold hover:bg-gold/90 text-dark transition-colors shadow-sm"
              >
                {modalConfig.mode === 'create' ? 'Criar Evento' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;

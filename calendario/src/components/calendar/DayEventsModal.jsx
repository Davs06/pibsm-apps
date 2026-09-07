import React from 'react';
import { X, Clock, MapPin, AlignLeft, Users, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventTypes } from '../../data/events';

const DayEventsModal = ({ isOpen, onClose, date, events }) => {
  // Extract month name and day number
  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-cream dark:bg-dark w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden relative z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gold/20 bg-white/50 dark:bg-black/20">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-dark dark:text-cream capitalize">
                  Eventos do Dia
                </h2>
                <span className="text-sm text-dark/70 dark:text-cream/70 capitalize flex items-center gap-1 mt-1">
                  <CalendarIcon size={14} />
                  {formattedDate}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-dark dark:text-cream"
              >
                <X size={24} />
              </button>
            </div>

            {/* Event List */}
            <div className="p-5 overflow-y-auto flex-1">
              {events && events.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {events.map((event, idx) => {
                    const typeConfig = eventTypes[event.type] || {
                      label: 'Evento',
                      color: '#38b6ff',
                    };

                    return (
                      <div
                        key={idx}
                        className="flex flex-col p-4 rounded-xl border border-gold/10 bg-white/80 dark:bg-white/5 shadow-sm relative overflow-hidden"
                      >
                        {/* Indicador de cor na lateral */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: typeConfig.color }}
                        />

                        <div className="flex justify-between items-start pl-2">
                          <div className="flex flex-col gap-1">
                            <span
                              className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block w-fit text-white"
                              style={{ backgroundColor: typeConfig.color }}
                            >
                              {typeConfig.label}
                            </span>
                            <h3 className="font-semibold text-lg text-dark dark:text-cream leading-tight mt-1">
                              {event.title}
                            </h3>
                          </div>

                          {event.time && (
                            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
                              <Clock size={14} className="text-dark/60 dark:text-cream/60" />
                              <span className="text-sm font-medium text-dark/90 dark:text-cream/90">
                                {event.time.substring(0, 5)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
                  <CalendarIcon size={48} className="text-gold mb-3 opacity-50" />
                  <p className="text-dark dark:text-cream font-medium">
                    Nenhum evento agendado para este dia.
                  </p>
                </div>
              )}
            </div>

            {/* SafeArea Padding for Mobile Bottom */}
            <div className="h-6 sm:hidden bg-cream dark:bg-dark"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DayEventsModal;

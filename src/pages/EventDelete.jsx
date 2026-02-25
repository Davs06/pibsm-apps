import { useParams, useNavigate, Link } from 'react-router-dom';
import { events, eventTypes } from '../data/events';
import './EventDelete.css';

const EventDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = events.find(e => e.id === parseInt(id));

  const handleDelete = () => {
    // Em uma aplicação real, aqui você excluiria o evento de um backend
    // ou localStorage. Por enquanto, apenas mostramos um alerta.
    alert('Evento excluído com sucesso!\n\nNota: Em uma aplicação real, a exclusão seria permanente.');
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!event) {
    return (
      <div className="event-delete-container">
        <h2>Evento não encontrado</h2>
        <Link to="/">Voltar ao calendário</Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="event-delete-container">
      <div className="delete-card">
        <div className="delete-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <h2>Excluir Evento</h2>
        
        <p className="delete-warning">
          Você está prestes a excluir este evento. Esta ação não pode ser desfeita.
        </p>

        <div className="event-details">
          <div className="detail-row">
            <strong>Título:</strong>
            <span>{event.title}</span>
          </div>
          
          <div className="detail-row">
            <strong>Data:</strong>
            <span>
              {formatDate(event.date)}
              {event.endDate && ` até ${formatDate(event.endDate)}`}
            </span>
          </div>
          
          {event.time && (
            <div className="detail-row">
              <strong>Horário:</strong>
              <span>{event.time}</span>
            </div>
          )}
          
          <div className="detail-row">
            <strong>Tipo:</strong>
            <span 
              className="event-type-badge"
              style={{ backgroundColor: eventTypes[event.type]?.color }}
            >
              {eventTypes[event.type]?.label || event.type}
            </span>
          </div>
        </div>

        <div className="delete-actions">
          <button 
            className="btn-cancel"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirm-delete"
            onClick={handleDelete}
          >
            Excluir Evento
          </button>
        </div>

        <Link to="/" className="back-link">← Voltar ao calendário</Link>
      </div>
    </div>
  );
};

export default EventDelete;

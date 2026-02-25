import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { events, eventTypes } from '../data/events';
import './EventForm.css';

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = events.find(e => e.id === parseInt(id));
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || '',
    endDate: event?.endDate || '',
    time: event?.time || '',
    type: event?.type || 'culto',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Em uma aplicação real, aqui você salvaria os dados em um backend
    // ou localStorage. Por enquanto, apenas mostramos um alerta.
    alert('Evento atualizado com sucesso!\n\nNota: Em uma aplicação real, as alterações seriam salvas permanentemente.');
    navigate('/');
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Em uma aplicação real, aqui você excluiria o evento
    alert('Evento excluído com sucesso!\n\nNota: Em uma aplicação real, a exclusão seria permanente.');
    navigate('/');
  };

  if (!event) {
    return (
      <div className="event-form-container">
        <h2>Evento não encontrado</h2>
        <Link to="/">Voltar ao calendário</Link>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="form-header">
        <h2>Editar Evento</h2>
        <Link to="/" className="btn-back">← Voltar ao calendário</Link>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Título do Evento</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Data de Início</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Data de Término (opcional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="time">Horário (opcional)</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Tipo de Evento</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {Object.entries(eventTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <div className="type-preview">
            Cor atual: 
            <span 
              className="type-color-indicator"
              style={{ backgroundColor: eventTypes[formData.type]?.color }}
            ></span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Salvar Alterações
          </button>
          <button 
            type="button" 
            className="btn-delete-form"
            onClick={handleDelete}
          >
            Excluir Evento
          </button>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o evento "{event.title}"?</p>
            <p className="warning">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventEdit;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import { events, eventTypes } from "../data/events";
import "./EventForm.css";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = netlifyIdentity.currentUser();

  const event = events.find((e) => e.id === parseInt(id));

  useEffect(() => {
    if (!user) {
      alert("Acesso negado. Faça login como admin.");
      navigate("/");
    }
  }, [user, navigate]);

  if (!event) return <div>Evento não encontrado.</div>;

  return (
    <div className="event-form-container">
      <h2>Editar: {event.title}</h2>
      <form
        className="event-form"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Simulação: Salvo!");
          navigate("/");
        }}
      >
        <div className="form-group">
          <label>Título</label>
          <input type="text" defaultValue={event.title} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-save">
            Salvar Alterações
          </button>
          <Link to="/" className="btn-cancel">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EventEdit;

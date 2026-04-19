import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import { events as initialEvents } from "../data/events";
import "./EventForm.css";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(netlifyIdentity.currentUser());

  // Proteção de Rota: Verifica se o usuário está logado
  useEffect(() => {
    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser) {
      alert("Acesso restrito. Por favor, faça login como administrador.");
      navigate("/");
    } else {
      setUser(currentUser);
      // Busca os dados do evento para preencher o formulário
      const foundEvent = initialEvents.find((e) => e.id === parseInt(id));
      if (foundEvent) {
        setEvent({ ...foundEvent });
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você integraria a lógica de salvar no seu backend ou estado global
    console.log("Evento atualizado:", event);

    alert("Evento atualizado com sucesso (Simulação)!");
    navigate("/");
  };

  if (!event) return <div className="loading">Carregando...</div>;

  return (
    <div className="event-form-container">
      <h2>Editar Evento</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Título do Evento:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={event.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={event.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            name="description"
            value={event.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-cancel"
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventEdit;

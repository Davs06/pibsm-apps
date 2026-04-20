import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const SetPasswordModal = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (
      hash &&
      (hash.includes("type=recovery") || hash.includes("type=invite"))
    ) {
      setIsOpen(true);
    }
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    // Atualiza a senha e o nome (metadados) do usuário
    const { error } = await supabase.auth.updateUser({
      password: formData.password,
      data: { full_name: formData.fullName },
    });

    if (error) {
      setError("Erro ao atualizar: " + error.message);
    } else {
      alert("Conta ativada com sucesso!");
      setIsOpen(false);
      window.location.hash = "";
      window.location.reload(); // Recarrega para aplicar o estado de logado
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Ativar Conta Admin</h3>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSetPassword}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Ex: João Silva"
                className="light-input"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Nova Senha</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                className="light-input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                required
                placeholder="Repita a senha"
                className="light-input"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Processando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordModal;

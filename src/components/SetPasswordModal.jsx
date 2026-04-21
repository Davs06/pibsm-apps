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
    // 1. Função para detectar o token na URL manualmente
    const detectToken = () => {
      const hash = window.location.hash;
      if (
        hash &&
        (hash.includes("access_token") ||
          hash.includes("type=invite") ||
          hash.includes("type=recovery"))
      ) {
        setIsOpen(true);
      }
    };

    // Executa ao carregar a página
    detectToken();

    // 2. Escuta mudanças na URL (caso o redirecionamento seja interno)
    window.addEventListener("hashchange", detectToken);

    // 3. Ouvinte oficial do Supabase Auth
    // Detecta quando o SDK processa o link de recuperação ou convite
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        window.location.hash.includes("type=invite")
      ) {
        setIsOpen(true);
      }
    });

    return () => {
      window.removeEventListener("hashchange", detectToken);
      subscription.unsubscribe();
    };
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    // Criamos a promessa separadamente para ter controle total
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: formData.password,
          data: { full_name: formData.fullName },
        });

        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      } catch (err) {
        reject(err);
      }
    });

    toast
      .promise(updatePromise, {
        loading: "A atualizar as suas credenciais...",
        success: () => {
          setIsOpen(false);
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return "Conta ativada com sucesso!";
        },
        error: (err) => {
          setLoading(false); // Libera o botão se der erro
          return `Erro: ${err.message}`;
        },
      })
      .finally(() => {
        // Garante que o loading saia mesmo se a promessa falhar silenciosamente
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Ativar Conta Admin</h3>
        </div>
        <div className="modal-body">
          <p>Defina os seus dados para começar a gerir o calendário.</p>

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
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
                style={{ backgroundColor: "#38b6ff" }}
              >
                {loading ? "A processar..." : "Finalizar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordModal;

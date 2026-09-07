import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      setLoading(false);
      onClose(); // Fecha o modal após login com sucesso
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Acesso Administrativo</h3>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleLogin}>
            {error && (
              <div
                style={{
                  color: '#e53e3e',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                placeholder="******"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

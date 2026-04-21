import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Navbar.css";

const Navbar = ({ user, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Logo" className="logo-img" />
        </Link>

        {/* Botão Sanduíche */}
        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Calendário
            </Link>
            <Link to="/semana" className="nav-link" onClick={closeMenu}>
              Próximos 7 Dias
            </Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <div className="user-info-group">
                <span className="user-email-label">{user.email}</span>
                <button onClick={handleLogout} className="admin-btn logout">
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  closeMenu();
                }}
                className="admin-btn login"
              >
                Acesso Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sincroniza o estado do usuário na Navbar
    setUser(netlifyIdentity.currentUser());

    netlifyIdentity.on("login", (user) => setUser(user));
    netlifyIdentity.on("logout", () => setUser(null));
  }, []);

  const handleAuth = () => {
    if (user) {
      netlifyIdentity.logout();
    } else {
      netlifyIdentity.open();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Calendário de Eventos</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Início
        </Link>
        {/* Botão de Autenticação */}
        <button onClick={handleAuth} className="nav-admin-btn">
          {user
            ? `Sair (${user.user_metadata.full_name || "Admin"})`
            : "Acesso Admin"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

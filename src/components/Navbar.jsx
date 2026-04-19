import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(netlifyIdentity.currentUser());
    netlifyIdentity.on("login", (u) => setUser(u));
    netlifyIdentity.on("logout", () => setUser(null));
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img
              src="/logo-igreja.png"
              alt="Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span className="logo-fallback">PIB</span>
          </Link>
        </div>

        <div className="navbar-title">
          <h1>Calendário de Eventos</h1>
          <span className="navbar-subtitle">Primeira Igreja Batista</span>
        </div>

        <div className="navbar-links">
          <button
            onClick={() =>
              user ? netlifyIdentity.logout() : netlifyIdentity.open()
            }
            className="nav-link admin-btn"
          >
            {user ? "Sair" : "Acesso Admin"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

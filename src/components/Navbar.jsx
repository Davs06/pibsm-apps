import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    netlifyIdentity.on("login", (u) => setUser(u));
    netlifyIdentity.on("logout", () => setUser(null));
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <div className="brand-group">
              {/* Imagem do Logo */}
              <img
                src="/logo.png"
                alt="Logo PIB"
                className="logo-img"
                onError={(e) => {
                  // Fallback: se a imagem falhar, mostra o texto 'PIB'
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              {/* <span className="logo-fallback" style={{ display: "none" }}>
                PIB
              </span> */}

              <div className="brand-text">
                <span className="church-name">PIB São Miguel Paulista</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="navbar-links">
          <button
            onClick={() =>
              user ? netlifyIdentity.logout() : netlifyIdentity.open()
            }
            className="admin-btn"
          >
            {user ? "Sair" : "Acesso Admin"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

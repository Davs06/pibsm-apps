import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            {/* Substitua o src pelo caminho do logo da sua igreja */}
            <img
              src="/logo-igreja.png"
              alt="Logo da Igreja"
              className="logo-img"
              onError={(e) => {
                // Fallback caso a imagem não exista
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
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Calendário</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import LoginModal from "./LoginModal";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthAction = () => {
    if (user) {
      supabase.auth.signOut();
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="brand-group">
            <img src="/logo.png" alt="Logo" className="logo-img" />
            <span className="church-name">Primeira Igreja Batista</span>
          </div>
        </div>

        <div className="navbar-links">
          <button onClick={handleAuthAction} className="admin-btn">
            {user ? "Sair" : "Acesso Admin"}
          </button>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Navbar;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import WeeklyView from "./pages/WeeklyView";
import Calendar from "./components/Calendar";
import Navbar from "./components/Navbar";
import SetPasswordModal from "./components/SetPasswordModal";
import LoginModal from "./components/LoginModal";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Sincroniza a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Ouve mudanças (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-wrapper">
        {/* Passamos o user e a função de abrir login como props */}
        <Navbar user={user} onLoginClick={() => setIsLoginOpen(true)} />

        <Toaster position="top-right" reverseOrder={false} />
        <SetPasswordModal />

        {/* Modal de Login controlado pelo App */}
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar user={user} />} />
            <Route path="/semana" element={<WeeklyView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import WeeklyView from "./pages/WeeklyView";
import CalendarView from "./pages/CalendarView";
import Navbar from "./components/Navbar";
import SetPasswordModal from "./components/SetPasswordModal";
import LoginModal from "./components/LoginModal";
import { Toaster } from "react-hot-toast";
import { authService } from "./services/authService";

function App() {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Busca sessão inicial
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
    });

    // Assina mudanças de auth
    const subscription = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Passamos o user e a função de abrir login como props */}
        <Navbar user={user} onLoginClick={() => setIsLoginOpen(true)} />

        <Toaster position="top-right" reverseOrder={false} />
        <SetPasswordModal />

        {/* Modal de Login controlado pelo App */}
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />

        <main className="flex-1 w-full py-6">
          <Routes>
            <Route path="/" element={<CalendarView user={user} />} />
            <Route path="/semana" element={<WeeklyView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

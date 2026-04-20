import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Navbar from "./components/Navbar";
import SetPasswordModal from "./components/SetPasswordModal";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />

        {/* Modal global para ativação de conta via e-mail */}
        <SetPasswordModal />

        <main className="main-content">
          <Routes>
            {/* Agora só precisamos da rota principal */}
            <Route path="/" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Navbar from "./components/Navbar";
import SetPasswordModal from "./components/SetPasswordModal";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        {/* Container para as notificações */}
        <Toaster position="top-right" reverseOrder={false} />
        <SetPasswordModal />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

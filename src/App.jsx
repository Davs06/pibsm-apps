import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import EventEdit from './pages/EventEdit';
import EventDelete from './pages/EventDelete';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/event/:id" element={<EventEdit />} />
            <Route path="/event/:id/delete" element={<EventDelete />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

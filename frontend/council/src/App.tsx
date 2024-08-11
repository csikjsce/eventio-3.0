import React from 'react';
import './App.css';
import Sidebar from './components/sidebar.tsx';
import Dashboard from './routes/dashboard.tsx';
import Events from './routes/events.tsx';
import Calendar from './routes/calendar.tsx';
import Statistics from './routes/statistics.tsx';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

import React from 'react';

import Sidebar from './components/sidebar.tsx';
import Dashboard from './routes/dashboard.tsx';
import Events from './routes/events.tsx';
import NewEvent from './routes/newEvent.tsx';
import Calendar from './routes/calendar.tsx';
import Statistics from './routes/statistics.tsx';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <div className="w-screen p-4 flex flex-row gap-4">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/addEvent" element={<NewEvent />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/stats" element={<Statistics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

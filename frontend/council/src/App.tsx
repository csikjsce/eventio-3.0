import React from "react";

import Sidebar from "./components/Sidebar.tsx";
import Dashboard from "./routes/dashboard.tsx";
import Events from "./routes/events.tsx";
import Calendar from "./routes/calendar.tsx";
import Statistics from "./routes/statistics.tsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
    return (
        <Router>
            <div className="w-screen p-4 flex flex-row gap-4 border-4 border-red-500">
                <Sidebar />
                <div>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/stats" element={<Statistics />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

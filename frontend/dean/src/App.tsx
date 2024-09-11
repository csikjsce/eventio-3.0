import { useState } from "react";
import React from "react";
import Sidebar from "./components/sidebar";
import EventRoute from "./screens/home/event";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
    return (
        <Router>
            <div className="p-4 flex flex-row gap-4">
                <div>
                    <Sidebar />
                    <Routes>
                        <Route path="/events" element={<EventRoute />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;

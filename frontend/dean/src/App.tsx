import { useState } from 'react'
import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Sidebar from './components/sidebar'
import EventRoute from './routes/event'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0)

  return (
      <Router>
          <div className="w-screen p-4 flex flex-row gap-4 border-4 border-red-500">
              <Sidebar />
              <div>
                  <Routes>
                      <Route path="/events" element={<EventRoute />} />
                  </Routes>
              </div>
          </div>
      </Router>
  );
}

export default App

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {ThemeProvider } from "@material-tailwind/react";
import Header from './components/Header.tsx';
import Card from './components/Card.tsx';
import Navbar from './components/Navbar.tsx';
import Home from './screens/home/home.tsx';
import UpcomingEventsCard from './components/UpcomingEventsCard.tsx';
import Search from './components/Search.tsx';
import Councils from './components/Councils.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider>
      < Councils />
    </ThemeProvider>
  </StrictMode>,
);

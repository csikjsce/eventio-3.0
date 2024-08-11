import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from "@material-tailwind/react";
import Header from './components/Header.tsx';
import Card from './components/Card.tsx';

import Home from './screens/home/home.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider>
      <Header />
    </ThemeProvider>
  </StrictMode>,
);

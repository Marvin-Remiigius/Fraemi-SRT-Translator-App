import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.jsx'; // App is the only component you need to import here

// Render only the App component.
// The router inside App will decide which page to show.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> 
  </StrictMode>,
);
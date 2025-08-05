import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.jsx'
import Home from './home.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home/>
    <App />
  </StrictMode>,
)

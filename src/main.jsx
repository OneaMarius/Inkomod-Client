import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css' // Actualizat pentru a puncta către noul folder

// Fix for mobile viewport height (calculates real screen height excluding browser bars)
const doc = document.documentElement;
const setHeight = () => {
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};

// Listen to resize and orientation changes
window.addEventListener('resize', setHeight);
setHeight();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
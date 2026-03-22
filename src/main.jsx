import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

const doc = document.documentElement;
const setHeight = () => {
	doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};

window.addEventListener('resize', setHeight);
setHeight();

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

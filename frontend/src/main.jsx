import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import HeartBackground from './components/HeartBackground';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HeartBackground />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

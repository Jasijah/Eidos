import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { OutputWindowApp } from './output/OutputWindowApp';
import './desktop/desktop-api';
import './styles.css';

const outputMode = new URLSearchParams(window.location.search).get('output') === '1';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{outputMode ? <OutputWindowApp /> : <App />}</React.StrictMode>);

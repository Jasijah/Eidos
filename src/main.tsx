import React from 'react'; import ReactDOM from 'react-dom/client'; import { OutputWindowApp } from './output/OutputWindowApp'; import { SiteRouter } from './site/SiteRouter'; import './desktop/desktop-api'; import './styles.css';
const outputMode = new URLSearchParams(window.location.search).get('output') === '1';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{outputMode ? <OutputWindowApp /> : <SiteRouter />}</React.StrictMode>);

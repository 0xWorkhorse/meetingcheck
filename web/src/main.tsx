import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { OgPage } from './pages/OgPage.js';
import { LocaleProvider } from './i18n/LocaleContext.js';
import './styles.css';

// Simple pathname-based routing: /og renders the OG capture page (used by
// the Playwright screenshot build step; never linked publicly). Everything
// else renders the marketing app.
const isOgRoute = window.location.pathname === '/og' || window.location.pathname === '/og/';
const Page = isOgRoute ? OgPage : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <Page />
    </LocaleProvider>
  </React.StrictMode>
);

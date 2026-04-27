import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { OgPage } from './pages/OgPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { LocaleProvider } from './i18n/LocaleContext.js';
import './styles.css';

// Simple pathname-based routing: /og renders the OG capture page (used by
// the Playwright screenshot build step; never linked publicly). /privacy
// renders the static privacy policy. Everything else renders the marketing app.
const path = window.location.pathname;
const isOgRoute = path === '/og' || path === '/og/';
const isPrivacyRoute = path === '/privacy' || path === '/privacy/';
const Page = isOgRoute ? OgPage : isPrivacyRoute ? PrivacyPage : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <Page />
    </LocaleProvider>
  </React.StrictMode>
);

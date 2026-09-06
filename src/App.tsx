/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainShell } from './components/MainShell';
import { LandingPage } from './components/LandingPage';
import { APP_LOGO_URL } from './constants/branding';

function AppContent() {
  const { user, activeTab, setActiveTab } = useApp();
  const prevLoggedInRef = useRef(user.isLoggedIn);

  useEffect(() => {
    // Ensure favicon is permanently locked to user's specified logo
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = APP_LOGO_URL;
  }, []);

  // When user fresh-logs-in (transition from false to true), navigate directly to home
  useEffect(() => {
    if (!prevLoggedInRef.current && user.isLoggedIn) {
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    prevLoggedInRef.current = user.isLoggedIn;
  }, [user.isLoggedIn, setActiveTab]);

  const handleEnterApp = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // When user is not logged in, or when activeTab is explicitly 'landing':
  // Show LandingPage
  if (!user.isLoggedIn || activeTab === 'landing') {
    return (
      <LandingPage
        onEnterApp={handleEnterApp}
      />
    );
  }

  // When user is logged in, show MainShell
  return (
    <MainShell
      onOpenLandingPage={() => setActiveTab('landing')}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

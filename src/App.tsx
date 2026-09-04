/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainShell } from './components/MainShell';
import { LandingPage } from './components/LandingPage';
import { APP_LOGO_URL } from './constants/branding';

function AppContent() {
  const { user } = useApp();
  const [previewLandingPage, setPreviewLandingPage] = useState(false);

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

  // When user is not logged in, or when someone explicitly opens the landing page:
  // Show LandingPage first!
  if (!user.isLoggedIn || previewLandingPage) {
    return (
      <LandingPage
        onEnterApp={() => setPreviewLandingPage(false)}
      />
    );
  }

  // When user is logged in, show MainShell
  return (
    <MainShell
      onOpenLandingPage={() => setPreviewLandingPage(true)}
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

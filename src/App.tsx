/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainShell } from './components/MainShell';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { user } = useApp();
  const [previewLandingPage, setPreviewLandingPage] = useState(false);

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

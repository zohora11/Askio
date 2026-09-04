/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { MainShell } from './components/MainShell';

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}

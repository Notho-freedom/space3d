import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Cyberspace } from './pages/Cyberspace';
import { ModuleViewer } from './pages/ModuleViewer';
import { SplashScreen } from './components/cyber/SplashScreen';
import { useScreenInit } from './useScreenInit.js';

/**
 * FRELAR CORP — CYBERSPACE.
 *
 * Un espace, deux écrans : l'index des modules 3D et la visionneuse d'un
 * module. Le lancement passe par la séquence d'amorçage ; la navigation
 * interne ne la rejoue pas — on n'entre dans la grille qu'une fois.
 */
interface AppProps {
  /** Séquence d'amorçage au lancement de l'espace. */
  showSplash?: boolean;
}

export function App({ showSplash = true }: AppProps) {
  const screen = useScreenInit();
  const splash = typeof screen.showSplash === 'boolean' ? screen.showSplash : showSplash;
  const [booted, setBooted] = useState(() => !splash);

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <div className="h-full w-full bg-[var(--fc-bg)]">
          <Routes>
            <Route path="/" element={<Cyberspace />} />
            <Route path="/module/:id" element={<ModuleViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <AnimatePresence>
          {!booted ? <SplashScreen onDone={() => setBooted(true)} /> : null}
        </AnimatePresence>
      </MotionConfig>
    </BrowserRouter>);

}
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND } from '../../data/brand';

/**
 * Écran de lancement : le symbole, le nom, la barre de chargement.
 */
interface SplashScreenProps {
  onDone: () => void;
}

const DURATION = 1900;

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      doneRef.current();
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const ratio = Math.min(1, (now - start) / (DURATION - 250));
      setProgress(ratio);
      if (ratio < 1) frame = requestAnimationFrame(tick);
    });
    const timer = window.setTimeout(() => doneRef.current(), DURATION);
    const skip = () => doneRef.current();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[var(--fc-surface)] px-6"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      role="status"
      aria-label="Chargement du CYBERSPACE FRELAR CORP">
      
      <motion.img
        src={BRAND.logo}
        alt=""
        className="h-11 w-auto sm:h-14"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />
      
      <motion.p
        className="font-display mt-4 text-center text-[20px] font-semibold text-[var(--fc-ink)] sm:text-[24px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}>
        
        {BRAND.space}
      </motion.p>

      <div className="mt-7 h-[3px] w-[160px] overflow-hidden rounded-full bg-[var(--fc-surface-2)] sm:w-[200px]">
        <div
          className="h-full rounded-full bg-[var(--fc-red)] transition-[width] duration-100 ease-linear"
          style={{ width: `${Math.round(progress * 100)}%` }} />
        
      </div>
    </motion.div>);

}
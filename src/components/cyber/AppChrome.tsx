import React from 'react';
import { BRAND } from '../../data/brand';

/**
 * Bandeau de l'application : le symbole, le nom de l'espace, sa nature.
 * Rien d'autre — c'est un repère, pas un tableau de bord.
 */
export function AppChrome() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--fc-border)] bg-[var(--fc-surface)] px-4 sm:gap-4 sm:px-6">
      <img src={BRAND.logo} alt={BRAND.company} className="h-6 w-auto sm:h-7" />
      <span className="h-6 w-px bg-[var(--fc-border)]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-display text-[15px] font-semibold leading-none text-[var(--fc-ink)]">{BRAND.space}</p>
        <p className="mt-1 hidden truncate text-[11.5px] leading-none text-[var(--fc-muted)] sm:block">
          {BRAND.signature}
        </p>
      </div>
    </header>);

}
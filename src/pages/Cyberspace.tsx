import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { CyberStage } from '../components/showcase/CyberStage';
import { CATEGORIES, MODULES, categoryOf, countIn, defaultFinish, findModule } from '../components/showcase/modules';
import type { ModuleCategory } from '../components/showcase/types';
import { AppChrome } from '../components/cyber/AppChrome';
import { ModuleCard } from '../components/cyber/ModuleCard';
import { BRAND } from '../data/brand';

/**
 * Index du CYBERSPACE : à gauche la pièce armée qui tourne dans son cadre, avec
 * sa fiche ; à droite la bibliothèque. Survoler une carte arme la scène, la
 * cliquer y entre. Le survol est temporisé, sinon un simple balayage de souris
 * reconstruirait plusieurs scènes WebGL en une seconde.
 */
const PREVIEW_DELAY = 200;

export function Cyberspace() {
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [filter, setFilter] = useState<ModuleCategory | 'tous'>('tous');
  const timerRef = useRef<number>();
  const active = findModule(activeId) ?? MODULES[0];
  const category = categoryOf(active.category);
  const visible = filter === 'tous' ? MODULES : MODULES.filter((module) => module.category === filter);
  const chips: {id: ModuleCategory | 'tous';short: string;count: number;}[] = [
  { id: 'tous', short: 'Tout', count: MODULES.length },
  ...CATEGORIES.map((entry) => ({ id: entry.id, short: entry.short, count: countIn(entry.id) }))];


  const preview = useCallback((id: string) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setActiveId(id), PREVIEW_DELAY);
  }, []);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return (
    <div className="flex h-full w-full flex-col bg-[var(--fc-bg)]">
      <AppChrome />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-5 lg:flex-row lg:overflow-hidden lg:p-6">
        {/* ══ Colonne visualisation ══ */}
        <section className="flex shrink-0 flex-col gap-4 lg:w-[42%] xl:w-[44%]" aria-label="Aperçu du module">
          <div className="relative h-[34vh] min-h-[220px] shrink-0 overflow-hidden rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-stage)] shadow-[var(--fc-shadow)] lg:h-auto lg:min-h-0 lg:flex-1">
            <CyberStage
              product={active}
              autoRotate
              interactive={false}
              finishHex={defaultFinish(active).hex}
              zoom={1.12}
              className="absolute inset-0" />
            
            <div className="fc-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/80 backdrop-blur-sm">
              Aperçu temps réel
            </span>
          </div>

          <div className="shrink-0 rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-5 shadow-[var(--fc-shadow)]">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--fc-surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--fc-muted)]">
                {category.short}
              </span>
              <span className="font-mono-tech text-[11px] text-[var(--fc-muted)]">{active.reference}</span>
            </div>
            <h1
              className="font-display mt-2.5 font-semibold leading-tight text-[var(--fc-ink)]"
              style={{ fontSize: 'var(--fc-h1)' }}>
              
              {active.name}
            </h1>
            <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-[var(--fc-text)]">{active.tagline}</p>

            <dl className="mt-4 hidden grid-cols-3 gap-3 sm:grid">
              {active.specs.slice(1, 4).map((spec) =>
              <div key={spec.label} className="rounded-lg bg-[var(--fc-surface-2)] px-3 py-2.5">
                  <dt className="text-[11px] leading-none text-[var(--fc-muted)]">{spec.label}</dt>
                  <dd className="font-display mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--fc-ink)]">
                    {spec.value}
                  </dd>
                </div>
              )}
            </dl>

            <Link
              to={`/module/${active.id}`}
              className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--fc-red)] px-4 py-2.5 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--fc-red-dark)] active:scale-[0.98]">
              
              Ouvrir la visionneuse
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                aria-hidden="true" />
              
            </Link>
          </div>
        </section>

        {/* ══ Colonne index ══ */}
        <section
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] shadow-[var(--fc-shadow)]"
          aria-label="Bibliothèque de modules">
          
          <div className="shrink-0 border-b border-[var(--fc-border)] p-5">
            <div className="flex items-end justify-between gap-4">
              <h2
                className="font-display font-semibold leading-none text-[var(--fc-ink)]"
                style={{ fontSize: 'var(--fc-h2)' }}>
                
                Bibliothèque de modules
              </h2>
              <span className="shrink-0 text-[12px] text-[var(--fc-muted)]">{MODULES.length} pièces</span>
            </div>
            <p className="mt-2 max-w-[72ch] text-[12.5px] leading-relaxed text-[var(--fc-text)]">{BRAND.claim}</p>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrer par métier">
              {chips.map((chip) => {
                const on = filter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilter(chip.id)}
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-[color,background-color,border-color] duration-150 ease-out ${
                    on ?
                    'border-[var(--fc-red)] bg-[var(--fc-red-soft)] text-[var(--fc-red)]' :
                    'border-[var(--fc-border)] text-[var(--fc-muted)] hover:border-[var(--fc-border-strong)] hover:text-[var(--fc-ink)]'}`
                    }>
                    
                    {chip.short}
                    <span className="ml-1.5 tabular-nums opacity-60">{chip.count}</span>
                  </button>);

              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 p-5 lg:overflow-y-auto">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visible.map((module) =>
              <li key={module.id} className="h-full">
                  <ModuleCard module={module} active={module.id === active.id} onPreview={() => preview(module.id)} />
                </li>
              )}
            </ul>
            <p className="mt-6 border-t border-[var(--fc-border)] pt-4 text-[11.5px] leading-relaxed text-[var(--fc-muted)]">
              {BRAND.legalName} · {BRAND.origin}
            </p>
          </div>
        </section>
      </main>
    </div>);

}
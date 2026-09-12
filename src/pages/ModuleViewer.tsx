import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  MaximizeIcon,
  MinimizeIcon,
  MousePointer2Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RulerIcon,
  SparklesIcon,
  TargetIcon } from
'lucide-react';
import { CyberStage } from '../components/showcase/CyberStage';
import { MODULES, categoryOf, defaultFinish, findModule } from '../components/showcase/modules';
import { HudButton } from '../components/cyber/HudButton';
import type { ProductDefinition } from '../components/showcase/types';
import { BRAND } from '../data/brand';

/**
 * Visionneuse d'un module : la scène occupe tout l'espace disponible, les
 * commandes vivent dans un bandeau clair et une barre flottante. Aucune
 * commande ne porte de libellé — icône, état, infobulle.
 */
export function ModuleViewer() {
  const { id } = useParams();
  const module = findModule(id);
  if (!module) return <MissingModule />;
  return <ViewerScreen key={module.id} module={module} />;
}

function MissingModule() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--fc-bg)] px-6 text-center">
      <p className="font-mono-tech text-[12px] text-[var(--fc-red)]">Erreur 404</p>
      <h1 className="font-display mt-2 text-2xl font-semibold text-[var(--fc-ink)]">Module introuvable</h1>
      <p className="mt-2 max-w-[44ch] text-[13px] text-[var(--fc-text)]">
        Cette référence n’existe pas dans la bibliothèque du {BRAND.space.toLowerCase()}.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--fc-red)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-[var(--fc-red-dark)]">
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Retour à la bibliothèque
      </Link>
    </div>);

}

interface ViewerScreenProps {
  module: ProductDefinition;
}

function ViewerScreen({ module }: ViewerScreenProps) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const index = MODULES.findIndex((entry) => entry.id === module.id);
  const category = categoryOf(module.category);

  const [autoRotate, setAutoRotate] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showDimensions, setShowDimensions] = useState(false);
  const [demo, setDemo] = useState(false);
  // L'acier brossé par défaut : c'est la finition réelle des pièces livrées.
  const [finishId, setFinishId] = useState(defaultFinish(module).id);
  const [viewId, setViewId] = useState(module.views[0].id);
  const [viewNonce, setViewNonce] = useState(0);
  const [dossier, setDossier] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280);
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);

  const finish = module.finishes.find((item) => item.id === finishId) ?? defaultFinish(module);
  const view = module.views.find((item) => item.id === viewId) ?? null;

  const applyView = useCallback((nextId: string) => {
    setViewId(nextId);
    setViewNonce((value) => value + 1);
  }, []);
  const reset = useCallback(() => {
    setViewId(module.views[0].id);
    setViewNonce((value) => value + 1);
    setAutoRotate(true);
  }, [module]);
  const goTo = useCallback(
    (step: number) => {
      const next = MODULES[(index + step + MODULES.length) % MODULES.length];
      navigate(`/module/${next.id}`);
    },
    [index, navigate]
  );

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    rootRef.current?.requestFullscreen?.().catch(() => setFullscreen(false));
  }, []);
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /* Raccourcis : on pilote sans quitter la pièce des yeux. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'Escape' && !document.fullscreenElement) navigate('/');
      if (event.key === 'ArrowLeft') goTo(-1);
      if (event.key === 'ArrowRight') goTo(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, navigate]);

  const onOrbit = useCallback(() => {
    setAutoRotate(false);
    setViewId('libre');
  }, []);

  return (
    <div ref={rootRef} className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--fc-bg)]">
      {/* ══ Bandeau : identité et navigation ══ */}
      <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--fc-border)] bg-[var(--fc-surface)] px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <HudButton icon={ArrowLeftIcon} label="Retour à la bibliothèque" placement="bottom" onClick={() => navigate('/')} />
          <span className="hidden h-6 w-px bg-[var(--fc-border)] sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="font-display truncate text-[14px] font-semibold leading-none text-[var(--fc-ink)] sm:text-[15px]">
              {module.name}
            </h1>
            <p className="mt-1 truncate text-[11.5px] leading-none text-[var(--fc-muted)]">
              <span className="font-mono-tech">{module.reference}</span>
              <span className="hidden sm:inline"> · {category.label} · {module.entity}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <HudButton icon={ChevronLeftIcon} label="Module précédent" placement="bottom" size="sm" onClick={() => goTo(-1)} />
          <span className="hidden w-[52px] text-center text-[12px] tabular-nums text-[var(--fc-muted)] sm:inline">
            {index + 1} / {MODULES.length}
          </span>
          <HudButton icon={ChevronRightIcon} label="Module suivant" placement="bottom" size="sm" onClick={() => goTo(1)} />
          <span className="mx-1 h-6 w-px bg-[var(--fc-border)]" aria-hidden="true" />
          <HudButton
            icon={InfoIcon}
            label="Fiche technique"
            placement="left"
            active={dossier}
            onClick={() => setDossier((value) => !value)} />
          
          <HudButton
            icon={fullscreen ? MinimizeIcon : MaximizeIcon}
            label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            placement="left"
            active={fullscreen}
            onClick={toggleFullscreen} />
          
        </div>
      </header>

      {/* ══ Scène ══ */}
      <div className="relative min-h-0 flex-1">
        <CyberStage
          product={module}
          autoRotate={autoRotate}
          showHotspots={showHotspots}
          showDimensions={showDimensions}
          phase={demo ? 1 : 0}
          finishHex={finish.hex}
          view={view}
          viewNonce={viewNonce}
          interactive
          onUserOrbit={onOrbit}
          onReady={() => setReady(true)}
          className="absolute inset-0 bg-[var(--fc-stage)]" />
        
        <div className="fc-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

        {!ready ?
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--fc-stage)]">
            <p className="text-[12.5px] text-white/50">Chargement de la maquette…</p>
          </div> :
        null}

        <p className="pointer-events-none absolute bottom-5 left-5 hidden items-center gap-2 text-[11.5px] text-white/45 lg:inline-flex">
          <MousePointer2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          Glisser pour pivoter · molette pour zoomer · ← → changer de module
        </p>

        {/* ══ Barre de commandes flottante ══ */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 transition-[padding] duration-200 ease-out ${
          dossier ? 'xl:pr-[356px]' : ''}`
          }>
          
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-1.5 shadow-[var(--fc-shadow-lg)]">
            {module.demo ?
            <>
                <HudButton
                icon={SparklesIcon}
                label={demo ? module.demo.active : module.demo.idle}
                tone="danger"
                active={demo}
                onClick={() => setDemo((value) => !value)} />
              
                <span className="mx-0.5 h-6 w-px bg-[var(--fc-border)]" aria-hidden="true" />
              </> :
            null}
            <HudButton
              icon={autoRotate ? PauseIcon : PlayIcon}
              label={autoRotate ? 'Suspendre la rotation' : 'Reprendre la rotation'}
              active={autoRotate}
              onClick={() => setAutoRotate((value) => !value)} />
            
            <HudButton
              icon={TargetIcon}
              label="Repères techniques"
              active={showHotspots}
              onClick={() => setShowHotspots((value) => !value)} />
            
            <HudButton
              icon={RulerIcon}
              label="Cotes"
              active={showDimensions}
              onClick={() => setShowDimensions((value) => !value)} />
            
            <HudButton icon={RotateCcwIcon} label="Réinitialiser la vue" onClick={reset} />

            <span className="mx-0.5 h-6 w-px bg-[var(--fc-border)]" aria-hidden="true" />
            <div className="flex items-center gap-1" role="group" aria-label="Point de vue">
              {module.views.map((entry, position) =>
              <HudButton key={entry.id} label={entry.label} size="sm" active={viewId === entry.id} onClick={() => applyView(entry.id)}>
                  <span className="font-mono-tech text-[11px] font-semibold tabular-nums">{position + 1}</span>
                </HudButton>
              )}
            </div>

            <span className="mx-0.5 h-6 w-px bg-[var(--fc-border)]" aria-hidden="true" />
            <div className="flex items-center gap-1.5 px-1" role="group" aria-label="Finition">
              {module.finishes.map((item) =>
              <div key={item.id} className="group relative">
                  <button
                  type="button"
                  onClick={() => setFinishId(item.id)}
                  aria-pressed={finishId === item.id}
                  aria-label={`Finition ${item.label}`}
                  className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-[var(--fc-surface)] transition-transform duration-150 ease-out hover:scale-110 ${
                  finishId === item.id ? 'ring-[var(--fc-red)]' : 'ring-[var(--fc-border)]'}`
                  }
                  style={{ background: item.swatch }} />
                
                  <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--fc-ink)] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
                  
                    {item.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ Fiche technique ══ */}
        <aside
          aria-label="Fiche technique"
          aria-hidden={!dossier}
          className={`absolute bottom-0 right-0 top-0 z-30 w-full max-w-[356px] overflow-y-auto border-l border-[var(--fc-border)] bg-[var(--fc-surface)] transition-transform duration-200 ease-out ${
          dossier ? 'translate-x-0' : 'translate-x-full'}`
          }>
          
          <div className="p-5">
            <p className="text-[11.5px] text-[var(--fc-muted)]">Fiche technique</p>
            <h2 className="font-display mt-1 text-[17px] font-semibold leading-snug text-[var(--fc-ink)]">
              {module.name}
            </h2>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--fc-text)]">{module.tagline}</p>

            <h3 className="font-display mt-6 text-[13px] font-semibold text-[var(--fc-ink)]">Caractéristiques</h3>
            <dl className="mt-2 divide-y divide-[var(--fc-border)] border-y border-[var(--fc-border)]">
              {module.specs.map((spec) =>
              <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[12px] text-[var(--fc-muted)]">{spec.label}</dt>
                  <dd className="text-right text-[12.5px] font-medium leading-snug text-[var(--fc-ink)]">{spec.value}</dd>
                </div>
              )}
            </dl>

            <h3 className="font-display mt-6 text-[13px] font-semibold text-[var(--fc-ink)]">
              Repères ({module.hotspots.length})
            </h3>
            <ul className="mt-2 space-y-2.5">
              {module.hotspots.map((hotspot) =>
              <li key={hotspot.id} className="flex gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fc-red)]" aria-hidden="true" />
                  <div>
                    <p className="font-display text-[12.5px] font-semibold leading-snug text-[var(--fc-ink)]">
                      {hotspot.label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-[var(--fc-text)]">{hotspot.value}</p>
                  </div>
                </li>
              )}
            </ul>

            {module.demo ?
            <div className="mt-6 rounded-lg bg-[var(--fc-red-soft)] p-3.5">
                <p className="text-[11.5px] font-semibold text-[var(--fc-red)]">Mise en service</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--fc-text)]">{module.demo.hint}</p>
              </div> :
            null}

            <p className="mt-6 border-t border-[var(--fc-border)] pt-4 text-[11.5px] leading-relaxed text-[var(--fc-muted)]">
              {BRAND.company} · {BRAND.space}
            </p>
          </div>
        </aside>
      </div>
    </div>);

}
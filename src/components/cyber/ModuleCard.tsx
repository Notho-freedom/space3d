import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { ProductDefinition } from '../showcase/types';
import { categoryOf } from '../showcase/modules';
import { ModuleGlyph } from './ModuleGlyph';

/**
 * Fiche d'un module dans l'index : domaine, référence, silhouette, promesse.
 * Assez pour choisir, pas assez pour se passer de la maquette. Le survol arme
 * la scène ; le clic y entre.
 */
interface ModuleCardProps {
  module: ProductDefinition;
  active: boolean;
  onPreview: () => void;
}

export function ModuleCard({ module, active, onPreview }: ModuleCardProps) {
  const category = categoryOf(module.category);
  return (
    <Link
      to={`/module/${module.id}`}
      onMouseEnter={onPreview}
      onFocus={onPreview}
      aria-current={active ? 'true' : undefined}
      className={`group flex h-full flex-col rounded-xl border bg-[var(--fc-surface)] p-4 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--fc-shadow)] ${
      active ?
      'border-[var(--fc-border)] lg:border-[var(--fc-red)] lg:shadow-[var(--fc-shadow)]' :
      'border-[var(--fc-border)] hover:border-[var(--fc-border-strong)]'}`
      }>
      
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--fc-surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--fc-muted)]">
          {category.short}
        </span>
        <span className="font-mono-tech text-[10.5px] text-[var(--fc-muted)]">{module.reference}</span>
      </div>

      <div className="mt-3 flex aspect-[16/10] items-center justify-center rounded-lg bg-[var(--fc-surface-2)]">
        <ModuleGlyph
          glyph={module.glyph}
          className={`h-[70%] w-[70%] transition-colors duration-200 ease-out ${
          active ? 'text-[var(--fc-muted)] lg:text-[var(--fc-red)]' : 'text-[var(--fc-muted)] group-hover:text-[var(--fc-red)]'}`
          } />
        
      </div>

      <h3 className="font-display mt-4 text-[15.5px] font-semibold leading-snug text-[var(--fc-ink)]">{module.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--fc-text)]">{module.tagline}</p>

      <span className="mt-auto flex items-center gap-1.5 pt-4 text-[12.5px] font-semibold text-[var(--fc-red)]">
        Ouvrir le module
        <ArrowRightIcon
          className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          aria-hidden="true" />
        
      </span>
    </Link>);

}
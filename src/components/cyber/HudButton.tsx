import React from "react";
import { BoxIcon } from "lucide-react";
/**
 * Commande de la visionneuse. Aucun libellé n'est rendu : on pilote à l'icône,
 * et le sens reste accessible par l'infobulle et par le nom accessible.
 */
type Placement = 'right' | 'left' | 'top' | 'bottom';
export interface HudButtonProps {
  label: string;
  icon?: BoxIcon;
  onClick?: () => void;
  /** Renseigné uniquement pour une bascule : c'est ce qui porte `aria-pressed`. */
  active?: boolean;
  tone?: 'neutral' | 'danger';
  size?: 'sm' | 'md';
  placement?: Placement;
  disabled?: boolean;
  children?: React.ReactNode;
}
const TIP: Record<Placement, string> = {
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2'
};
export function HudButton({
  label,
  icon: Icon,
  onClick,
  active,
  tone = 'neutral',
  size = 'md',
  placement = 'top',
  disabled = false,
  children
}: HudButtonProps) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const glyph = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]';
  const skin = active ? tone === 'danger' ? 'bg-[var(--fc-red)] text-white' : 'bg-[var(--fc-red-soft)] text-[var(--fc-red)]' : 'text-[var(--fc-muted)] hover:bg-[var(--fc-surface-2)] hover:text-[var(--fc-ink)]';
  return <div className="group relative">
      <button type="button" onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={active} className={`flex ${box} items-center justify-center rounded-lg transition-[color,background-color] duration-150 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${skin}`}>
        {Icon ? <Icon className={glyph} aria-hidden="true" /> : null}
        {children}
      </button>
      <span role="tooltip" className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[var(--fc-ink)] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100 ${TIP[placement]}`}>
        {label}
      </span>
    </div>;
}
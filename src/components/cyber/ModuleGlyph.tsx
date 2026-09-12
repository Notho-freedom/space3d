import React from 'react';
import type { GlyphKey } from '../showcase/types';

/**
 * Schéma vectoriel d'un module : la vignette d'index. Elle ne remplace pas la
 * maquette — elle en donne la silhouette, comme un plan de pose sur une fiche
 * technique. Un seul trait, une seule couleur héritée du parent.
 */
interface ModuleGlyphProps {
  glyph: GlyphKey;
  className?: string;
}

function Rack() {
  return (
    <g>
      <rect x="26" y="10" width="48" height="80" />
      <rect x="32" y="16" width="36" height="9" />
      <rect x="32" y="29" width="36" height="9" />
      <rect x="32" y="42" width="36" height="9" />
      <rect x="32" y="59" width="36" height="22" />
      <line x1="36" y1="20.5" x2="44" y2="20.5" />
      <line x1="36" y1="33.5" x2="44" y2="33.5" />
      <line x1="36" y1="46.5" x2="44" y2="46.5" />
      <circle cx="64" cy="20.5" r="1.6" />
      <circle cx="64" cy="33.5" r="1.6" />
      <line x1="38" y1="65" x2="62" y2="65" />
      <line x1="38" y1="71" x2="56" y2="71" />
      <line x1="26" y1="94" x2="74" y2="94" />
    </g>);

}

function Datacenter() {
  return (
    <g>
      <line x1="6" y1="86" x2="94" y2="86" />
      <path d="M12 86 L38 40" opacity="0.4" />
      <path d="M88 86 L62 40" opacity="0.4" />
      {[0, 1, 2].map((i) =>
      <React.Fragment key={i}>
          <rect x={10 + i * 8} y={54 - i * 5} width="12" height={28 - i * 4} />
          <rect x={78 - i * 8} y={54 - i * 5} width="12" height={28 - i * 4} />
          <line x1={13 + i * 8} y1={60 - i * 5} x2={19 + i * 8} y2={60 - i * 5} />
          <line x1={81 - i * 8} y1={60 - i * 5} x2={87 - i * 8} y2={60 - i * 5} />
        </React.Fragment>
      )}
      <line x1="40" y1="86" x2="46" y2="40" strokeDasharray="2 3" opacity="0.6" />
      <line x1="60" y1="86" x2="54" y2="40" strokeDasharray="2 3" opacity="0.6" />
      <line x1="20" y1="26" x2="80" y2="26" />
      <line x1="34" y1="26" x2="34" y2="34" />
      <line x1="66" y1="26" x2="66" y2="34" />
    </g>);

}

function Mesh() {
  return (
    <g>
      <rect x="10" y="30" width="34" height="24" />
      <line x1="10" y1="54" x2="44" y2="54" />
      <line x1="21" y1="60" x2="33" y2="60" />
      <rect x="52" y="28" width="20" height="28" />
      <rect x="78" y="34" width="12" height="22" />
      <line x1="27" y1="54" x2="27" y2="60" />
      <path d="M27 66 C 40 82, 62 82, 62 60" opacity="0.6" />
      <path d="M62 66 C 72 80, 84 78, 84 60" opacity="0.6" />
      <line x1="10" y1="88" x2="90" y2="88" />
      <circle cx="62" cy="24" r="2" />
      <circle cx="84" cy="30" r="2" />
    </g>);

}

function Elevator() {
  return (
    <g>
      <rect x="26" y="8" width="48" height="84" />
      <circle cx="46" cy="18" r="6" />
      <line x1="41" y1="20" x2="41" y2="44" />
      <line x1="51" y1="20" x2="51" y2="44" />
      <rect x="34" y="44" width="26" height="34" />
      <line x1="47" y1="44" x2="47" y2="78" />
      <rect x="65" y="30" width="7" height="16" />
      <line x1="68.5" y1="20" x2="68.5" y2="30" />
      <line x1="26" y1="92" x2="74" y2="92" />
      <line x1="30" y1="30" x2="30" y2="86" strokeDasharray="2 4" />
    </g>);

}

function Generator() {
  return (
    <g>
      <rect x="8" y="62" width="84" height="16" />
      <rect x="30" y="36" width="34" height="26" />
      <rect x="36" y="28" width="22" height="8" />
      <circle cx="20" cy="49" r="12" />
      <circle cx="20" cy="49" r="3" />
      <line x1="12" y1="41" x2="28" y2="57" opacity="0.5" />
      <line x1="28" y1="41" x2="12" y2="57" opacity="0.5" />
      <rect x="66" y="40" width="20" height="22" />
      <line x1="70" y1="40" x2="70" y2="62" opacity="0.5" />
      <line x1="76" y1="40" x2="76" y2="62" opacity="0.5" />
      <line x1="82" y1="40" x2="82" y2="62" opacity="0.5" />
      <path d="M58 36 L58 18 L70 18" />
      <line x1="8" y1="84" x2="92" y2="84" />
      <line x1="18" y1="78" x2="18" y2="84" />
      <line x1="82" y1="78" x2="82" y2="84" />
    </g>);

}

function Hvac() {
  return (
    <g>
      <rect x="10" y="18" width="26" height="52" />
      <line x1="14" y1="26" x2="32" y2="26" />
      <line x1="14" y1="32" x2="32" y2="32" />
      <line x1="14" y1="38" x2="32" y2="38" />
      <circle cx="23" cy="56" r="7" />
      <line x1="6" y1="70" x2="94" y2="70" />
      <line x1="58" y1="70" x2="72" y2="70" strokeDasharray="2 2" />
      <rect x="70" y="40" width="22" height="20" />
      <circle cx="76" cy="36" r="4" />
      <circle cx="86" cy="36" r="4" />
      <path d="M23 76 L23 86 L65 86 L65 66" strokeDasharray="3 3" opacity="0.7" />
      <path d="M65 62 l -3 5 h 6 z" />
      <path d="M36 24 L70 24 L70 40" opacity="0.6" />
    </g>);

}

function Solar() {
  return (
    <g>
      <path d="M14 44 L58 28 L86 40 L42 56 Z" />
      <line x1="26" y1="40" x2="70" y2="46" opacity="0.5" />
      <line x1="38" y1="36" x2="66" y2="52" opacity="0.5" />
      <line x1="52" y1="31" x2="54" y2="53" opacity="0.5" />
      <line x1="50" y1="42" x2="50" y2="76" />
      <line x1="42" y1="76" x2="58" y2="76" />
      <line x1="10" y1="84" x2="90" y2="84" />
      <line x1="50" y1="76" x2="50" y2="84" />
      <rect x="72" y="62" width="14" height="20" />
      <line x1="75" y1="68" x2="83" y2="68" />
      <line x1="58" y1="76" x2="72" y2="72" strokeDasharray="2 3" />
      <circle cx="24" cy="18" r="6" opacity="0.6" />
    </g>);

}

function Gate() {
  return (
    <g>
      <line x1="8" y1="84" x2="92" y2="84" />
      <rect x="10" y="24" width="6" height="60" />
      <rect x="84" y="30" width="6" height="54" />
      <line x1="22" y1="34" x2="80" y2="34" />
      <line x1="22" y1="66" x2="80" y2="66" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) =>
      <React.Fragment key={i}>
          <line x1={24 + i * 9} y1="28" x2={24 + i * 9} y2="72" />
          <path d={`M${21 + i * 9} 28 l 3 -5 l 3 5 z`} />
        </React.Fragment>
      )}
      <line x1="22" y1="72" x2="80" y2="72" />
      <circle cx="34" cy="78" r="4" />
      <circle cx="68" cy="78" r="4" />
      <path d="M88 18 l 6 6 l -6 6" opacity="0.7" />
    </g>);

}

function Barrier() {
  return (
    <g>
      <line x1="6" y1="86" x2="94" y2="86" />
      <rect x="14" y="44" width="18" height="42" />
      <circle cx="23" cy="38" r="4" />
      <line x1="32" y1="54" x2="90" y2="54" />
      <line x1="32" y1="60" x2="90" y2="60" />
      {[0, 1, 2, 3].map((i) =>
      <line key={i} x1={40 + i * 13} y1="54" x2={46 + i * 13} y2="60" opacity="0.6" />
      )}
      <rect x="84" y="60" width="6" height="26" />
      <path d="M36 48 a 14 14 0 0 1 10 -12" strokeDasharray="2 3" opacity="0.7" />
      <line x1="46" y1="76" x2="80" y2="76" strokeDasharray="3 3" opacity="0.5" />
    </g>);

}

const GLYPHS: Partial<Record<GlyphKey, () => JSX.Element>> = {
  rack: Rack,
  datacenter: Datacenter,
  mesh: Mesh,
  elevator: Elevator,
  generator: Generator,
  hvac: Hvac,
  solar: Solar,
  gate: Gate,
  barrier: Barrier
};

export function ModuleGlyph({ glyph, className = '' }: ModuleGlyphProps) {
  const Shape = GLYPHS[glyph] ?? Rack;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden="true">
      
      <Shape />
    </svg>);

}
import type * as THREE from 'three';
/**
 * Contrat commun à tous les modules 3D du CYBERSPACE.
 * Chaque module décrit sa géométrie, ses repères et sa mise en service ;
 * la scène reste générique et n'a rien à savoir de la pièce affichée.
 */
export type ModuleCategory = 'it' | 'technique' | 'metallique';
export type GlyphKey =
'rack' |
'datacenter' |
'router' |
'mesh' |
'elevator' |
'generator' |
'hvac' |
'solar' |
'gate' |
'barrier';
export interface Hotspot {
  id: string;
  label: string;
  value: string;
  /** Ancrage exprimé dans le repère de `part` (ou du modèle si absent). */
  position: [number, number, number];
  /** Normale sortante : le repère s'efface quand la face passe derrière. */
  normal: [number, number, number];
  side: 'left' | 'right';
  /** Sous-ensemble mobile auquel l'ancrage est solidaire. */
  part?: string;
}
export interface Dimension {
  id: string;
  value: string;
  from: [number, number, number];
  to: [number, number, number];
  /** Direction d'écartement souhaitée, en repère écran (x droite, y bas). */
  bias: [number, number];
  part?: string;
}
export interface Finish {
  id: string;
  label: string;
  hex: number;
  swatch: string;
}
export interface CameraView {
  id: string;
  label: string;
  theta: number;
  phi: number;
  radius: number;
}
export interface Spec {
  label: string;
  value: string;
}
export interface BuiltModel {
  group: THREE.Group;
  /** Sous-ensembles mobiles adressables par les ancrages. */
  parts?: Record<string, THREE.Object3D>;
  setFinish: (hex: number) => void;
  /** État de la mise en service, de 0 (repos) à 1 (position finale). */
  setPhase?: (phase: number) => void;
  dispose: () => void;
}
export interface ProductDefinition {
  id: string;
  name: string;
  reference: string;
  /** Unité FRELAR qui opère la pièce : sert de signature dans le HUD. */
  entity: string;
  category: ModuleCategory;
  /** Schéma vectoriel affiché sur la carte du module. */
  glyph: GlyphKey;
  tagline: string;
  /** Point visé par la caméra. */
  target: [number, number, number];
  /** Brume propre au module [début, fin]. Sinon calculée sur le rayon caméra. */
  fog?: [number, number];
  views: CameraView[];
  finishes: Finish[];
  hotspots: Hotspot[];
  dimensions: Dimension[];
  specs: Spec[];
  /** Mise en service animée : libellés des deux états. */
  demo?: {
    idle: string;
    active: string;
    hint: string;
  };
  build: () => BuiltModel;
}
import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage } from './stage';

/**
 * Portail coulissant autoportant « PTL-6 » — FRELAR MÉTAL.
 *
 * Pas de rail au sol : le vantail est porté en porte-à-faux par deux chariots
 * à galets et guidé en tête. La crémaillère, le pignon, les fins de course et
 * les cellules sont modélisés parce que c'est là que se joue la fiabilité d'un
 * portail — pas dans le remplissage.
 */
const CLOSED_X = -0.1;
const OPEN_X = 3.3;
const PINION_R = 0.075;

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}

function build(): BuiltModel {
  const stage = new Stage();
  const shellMat = stage.standard(0x8ea3b4, 0.96, 0.3);
  const frameMat = stage.standard(0x7f95a7, 0.96, 0.32);
  const steel = stage.standard(0xa8bccb, 1, 0.22);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const concrete = stage.standard(0x2a3440, 0.1, 0.95);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const beaconMat = led(0xffa53d, 0.4, 0, 1200);
  const beamMat = led(0xe30613, 0.5, 0, 1400);
  const okMat = led(0x36d399, 1.9, 0.3, 1900, 240);
  const panelMat = led(0x4de0ff, 0.6, 0, 3000);

  /* ═══ Génie civil ═══ */
  stage.box(2.6, 0.16, 0.8, 1.8, 0.08, 0, concrete);
  stage.box(2.4, 0.02, 0.6, 1.8, 0.17, 0, dark);
  [-1.55, 1.35, 2.25].forEach((x) => stage.box(0.44, 0.14, 0.44, x, 0.07, 0, concrete));
  stage.contactShadow(9.5, 4.2, 1.2, 0);
  stage.rings(2.6, 0.9, 0);

  /* ═══ Poteau de fermeture : butée, gâche, feu orange, lecteur ═══ */
  stage.box(0.19, 2.1, 0.19, -1.55, 1.06, 0, frameMat);
  stage.box(0.24, 0.05, 0.24, -1.55, 2.13, 0, shellMat);
  stage.box(0.06, 0.9, 0.1, -1.45, 0.95, 0, steel);
  stage.box(0.04, 0.16, 0.14, -1.44, 0.62, 0, dark);
  stage.box(0.05, 0.24, 0.05, -1.55, 2.28, 0, frameMat);
  stage.cylinder(0.075, 0.075, 0.1, -1.55, 2.45, 0, beaconMat, stage.group, 16);
  stage.cylinder(0.08, 0.08, 0.02, -1.55, 2.51, 0, dark, stage.group, 16);
  stage.box(0.1, 1.15, 0.1, -1.95, 0.58, 1.0, frameMat);
  stage.box(0.16, 0.24, 0.1, -1.95, 1.18, 1.0, shellMat);
  stage.box(0.12, 0.18, 0.02, -1.95, 1.18, 1.06, panelMat);

  /* ═══ Poteaux de guidage et chariots à galets ═══ */
  const wheels: THREE.Mesh[] = [];
  [1.35, 2.25].forEach((x) => {
    stage.box(0.17, 1.95, 0.17, x, 0.98, 0, frameMat);
    stage.box(0.22, 0.05, 0.22, x, 1.98, 0, shellMat);
    stage.box(0.14, 0.12, 0.3, x, 1.86, 0, steel);
    [-0.09, 0.09].forEach((z) => {
      stage.cylinder(0.035, 0.035, 0.06, x, 1.86, z, dark, stage.group, 14).rotation.x = Math.PI / 2;
    });
    stage.box(0.36, 0.12, 0.26, x, 0.26, 0, frameMat);
    [-0.11, 0.11].forEach((dx) => {
      [-0.08, 0.08].forEach((dz) => {
        const wheel = stage.cylinder(0.075, 0.075, 0.05, x + dx, 0.4, dz, steel, stage.group, 18);
        wheel.rotation.x = Math.PI / 2;
        wheels.push(wheel);
        stage.cylinder(0.02, 0.02, 0.08, x + dx, 0.4, dz, dark, stage.group, 8).rotation.x = Math.PI / 2;
      });
    });
    stage.box(0.42, 0.06, 0.3, x, 0.2, 0, steel);
  });

  /* ═══ Motorisation : carter, pignon, fin de course ═══ */
  stage.box(0.36, 0.46, 0.32, 1.8, 0.4, 0.4, shellMat);
  stage.box(0.4, 0.05, 0.36, 1.8, 0.65, 0.4, frameMat);
  stage.box(0.03, 0.2, 0.16, 1.99, 0.48, 0.4, dark);
  stage.box(0.012, 0.1, 0.1, 2.007, 0.48, 0.4, panelMat);
  stage.cylinder(0.02, 0.02, 0.04, 2.007, 0.3, 0.4, okMat, stage.group, 12).rotation.z = Math.PI / 2;
  const pinion = stage.group3(stage.group, 1.8, 0.44, 0.16);
  stage.cylinder(PINION_R, PINION_R, 0.05, 0, 0, 0, steel, pinion, 20);
  for (let i = 0; i < 12; i += 1) {
    const a = i / 12 * Math.PI * 2;
    stage.box(0.022, 0.05, 0.03, Math.cos(a) * (PINION_R + 0.012), 0, Math.sin(a) * (PINION_R + 0.012), steel, pinion);
  }
  stage.cylinder(0.026, 0.026, 0.1, 1.8, 0.44, 0.3, dark, stage.group, 12).rotation.z = Math.PI / 2;

  /* ═══ Cellules photoélectriques ═══ */
  [-1.55, 1.35].forEach((x, i) => {
    stage.box(0.09, 0.62, 0.09, x, 0.31, 0.92, frameMat);
    stage.box(0.12, 0.2, 0.11, x, 0.66, 0.92, shellMat);
    stage.box(0.02, 0.09, 0.07, x + (i === 0 ? 0.065 : -0.065), 0.66, 0.92, beamMat);
  });
  const beam = stage.cylinder(0.008, 0.008, 2.9, -0.1, 0.66, 0.92, beamMat, stage.group, 6);
  beam.rotation.z = Math.PI / 2;

  /* ═══ Vantail : poutre porteuse, cadre, barreaudage, crémaillère ═══ */
  const leaf = stage.group3(stage.group, CLOSED_X, 0.34, 0);
  stage.box(3.8, 0.16, 0.12, 0, 0, 0, frameMat, leaf);
  [0.07, -0.07].forEach((y) => stage.box(3.8, 0.03, 0.14, 0, y, 0, steel, leaf));
  stage.box(3.8, 0.07, 0.05, 0, 0.2, 0, frameMat, leaf);
  stage.box(3.8, 0.05, 0.04, 0, 0.78, 0, frameMat, leaf);
  stage.box(3.8, 0.1, 0.07, 0, 1.5, 0, frameMat, leaf);
  [-1.87, 1.87].forEach((x) => stage.box(0.1, 1.42, 0.07, x, 0.82, 0, frameMat, leaf));
  stage.box(0.07, 1.6, 0.09, 1.9, 0.86, 0, shellMat, leaf);
  // Barreaudage et pointes forgées : la signature d'un ouvrage soudé.
  for (let i = 0; i < 21; i += 1) {
    const x = -1.7 + i * 0.17;
    stage.box(0.032, 1.34, 0.032, x, 0.85, 0, steel, leaf);
    stage.cylinder(0.001, 0.026, 0.09, x, 1.6, 0, steel, leaf, 4);
  }
  stage.box(3.66, 0.34, 0.02, 0, 0.4, 0.03, shellMat, leaf);
  for (let i = 0; i < 26; i += 1) {
    stage.box(0.032, 0.05, 0.05, -1.68 + i * 0.135, -0.13, 0.16, steel, leaf);
  }
  stage.box(3.7, 0.03, 0.05, 0, -0.1, 0.16, dark, leaf);
  [-1.6, 1.6].forEach((x) => stage.box(0.05, 0.04, 0.06, x, -0.15, 0.16, beamMat, leaf));
  stage.cylinder(0.05, 0.05, 0.04, -1.8, -0.16, 0, dark, leaf, 14).rotation.x = Math.PI / 2;

  return {
    group: stage.group,
    parts: { leaf, pinion },
    setFinish: (hex) => {
      shellMat.color.setHex(hex);
      frameMat.color.setHex(hex);
    },
    setPhase: (phase) => {
      const t = performance.now();
      pulses.forEach((pulse) => {
        if (pulse.swing === 0) return;
        pulse.material.emissiveIntensity =
        pulse.base + Math.sin((t + pulse.offset) / pulse.period * Math.PI * 2) * pulse.swing;
      });
      /* Départ et arrivée ralentis : un vantail de 300 kg ne démarre pas sec.
         Le pignon suit la course, dent pour dent. */
      const eased = phase * phase * (3 - 2 * phase);
      const travel = (OPEN_X - CLOSED_X) * eased;
      leaf.position.x = CLOSED_X + travel;
      pinion.rotation.z = -travel / PINION_R;
      wheels.forEach((wheel) => {
        wheel.rotation.z = -travel / 0.075;
      });

      const moving = phase > 0.01 && phase < 0.99;
      beaconMat.emissiveIntensity = moving ? 1.2 + Math.abs(Math.sin(t / 240)) * 2.2 : 0.15;
      beamMat.emissiveIntensity = 0.4 + (phase > 0.02 ? 1.6 : 0);
      beam.visible = phase > 0.02;
      panelMat.emissiveIntensity = 0.5 + phase * 1.4;
      okMat.emissiveIntensity = 0.6 + (1 - Math.abs(phase - 0.5) * 2) * 1.4;
    },
    dispose: () => stage.dispose()
  };
}

export const GATE_PRODUCT: ProductDefinition = {
  id: 'portail-coulissant',
  name: 'Portail coulissant',
  reference: 'PTL-6',
  entity: 'FRELAR MÉTAL',
  category: 'metallique',
  glyph: 'gate',
  tagline:
  'Autoportant sans rail au sol : poutre en porte-à-faux, chariots à galets, crémaillère et pignon. La mise en service joue l’ouverture complète, sécurités comprises.',
  target: [0.9, 1, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.66, phi: 0.2, radius: 8.6 },
  { id: 'face', label: 'Face', theta: 0, phi: 0.12, radius: 8 },
  { id: 'mecanisme', label: 'Mécanisme', theta: 0.5, phi: 0.3, radius: 3.4 },
  { id: 'guidage', label: 'Guidage haut', theta: 0.8, phi: 0.5, radius: 4.2 },
  { id: 'plongee', label: 'Plongée', theta: 0.4, phi: 0.95, radius: 8.4 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'poutre', label: 'Poutre de portée', value: 'Porte-à-faux · aucun rail au sol', position: [0, 0.34, 0.1], normal: [0, 0.1, 0.99], side: 'left', part: 'leaf' },
  { id: 'chariots', label: 'Chariots à galets', value: '8 galets sur roulements étanches', position: [1.8, 0.4, 0.2], normal: [0, 0.2, 0.98], side: 'right' },
  { id: 'cremaillere', label: 'Crémaillère et pignon', value: 'Module 4 · jeu réglé à 1,5 mm', position: [1.8, 0.3, 0.24], normal: [0.2, -0.3, 0.93], side: 'right' },
  { id: 'guidage', label: 'Guidage de tête', value: 'Deux galets pinçant le cadre haut', position: [1.35, 1.9, 0.16], normal: [0.1, 0.5, 0.86], side: 'right' },
  { id: 'cellules', label: 'Cellules de sécurité', value: 'Arrêt et réouverture sur obstacle', position: [1.35, 0.68, 0.98], normal: [0.2, 0.3, 0.93], side: 'right' },
  { id: 'feu', label: 'Feu de mouvement', value: 'Clignote pendant toute la manœuvre', position: [-1.55, 2.5, 0.08], normal: [-0.3, 0.6, 0.74], side: 'left' },
  { id: 'barreaudage', label: 'Barreaudage forgé', value: '21 barreaux · pointes soudées une à une', position: [-1, 1.4, 0.04], normal: [-0.2, 0.3, 0.93], side: 'left' },
  { id: 'lecteur', label: 'Lecteur de badge', value: 'Ouverture nominative · journal d’accès', position: [-1.95, 1.18, 1.08], normal: [-0.3, 0.2, 0.93], side: 'left' }],

  dimensions: [
  { id: 'passage', value: 'Passage 2 900 mm', from: [-1.45, 0.24, 0.42], to: [1.45, 0.24, 0.42], bias: [0, 1] },
  { id: 'hauteur', value: 'Hauteur 1 800 mm', from: [-2.2, 0.16, 0], to: [-2.2, 1.96, 0], bias: [-1, 0] },
  { id: 'vantail', value: 'Vantail 3 800 mm', from: [-2, 2.1, 0], to: [1.8, 2.1, 0], bias: [0, -1] }],

  specs: [
  { label: 'Référence', value: 'PTL-6' },
  { label: 'Passage libre', value: '2 900 mm' },
  { label: 'Masse du vantail', value: '310 kg' },
  { label: 'Construction', value: 'Acier soudé · galvanisé à chaud' },
  { label: 'Motorisation', value: '24 V · 0,17 m/s · départ progressif' },
  { label: 'Sécurités', value: 'Cellules · détection d’effort · feu orange' },
  { label: 'Manœuvres', value: '300 cycles/jour · déverrouillage manuel' },
  { label: 'Finition', value: 'Thermolaquage 80 µm sur galvanisation' }],

  demo: {
    idle: 'Ouvrir le portail',
    active: 'Refermer le portail',
    hint: 'Départ ralenti, course sur crémaillère, arrivée amortie — feu orange pendant la manœuvre'
  },
  build
};
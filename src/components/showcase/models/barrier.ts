import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Barrière levante « BAR-4 » — FRELAR MÉTAL.
 *
 * Le carter est ouvert côté maintenance : on voit le moto-réducteur, la
 * manivelle et surtout le ressort d'équilibrage, qui est ce qui permet à un
 * moteur de 200 W de lever une lisse de trois mètres et demi.
 */
/* Rotation positive autour de Z : la lisse, qui pointe vers +X, monte. Une
   valeur négative la faisait plonger dans le sol. */
const BOOM_UP = Math.PI / 2 - 0.06;

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
  const white = stage.standard(0xe8eef4, 0.3, 0.5);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const boomLed = led(0xe30613, 1.2, 0, 2000);
  const beaconMat = led(0xffa53d, 0.3, 0, 1200);
  const loopMat = led(0x4de0ff, 0.3, 0, 2400);
  const redLamp = led(0xe30613, 1.8, 0, 2000);
  const greenLamp = led(0x36d399, 0.1, 0, 2000);
  const panelMat = led(0x4de0ff, 0.6, 0, 3000);

  /* ═══ Massif et embase ═══ */
  stage.box(0.66, 0.14, 0.66, 0, 0.07, 0, concrete);
  stage.box(0.5, 0.03, 0.5, 0, 0.155, 0, frameMat);
  [-0.19, 0.19].forEach((x) => {
    [-0.19, 0.19].forEach((z) => stage.cylinder(0.016, 0.016, 0.06, x, 0.14, z, steel, stage.group, 8));
  });
  stage.contactShadow(8.6, 4, 1.4, 0);
  stage.rings(2.3, 1, 0);

  /* ═══ Carter, ouvert côté maintenance ═══ */
  stage.box(0.4, 1.12, 0.38, 0, 0.73, 0, shellMat);
  stage.box(0.46, 0.07, 0.44, 0, 1.32, 0, frameMat);
  stage.box(0.03, 0.94, 0.32, 0.2, 0.72, 0, dark);
  stage.box(0.012, 0.2, 0.16, 0.218, 1.06, 0, panelMat);
  stage.cylinder(0.022, 0.022, 0.02, 0.218, 0.82, 0.08, steel, stage.group, 12).rotation.z = Math.PI / 2;
  stage.box(0.02, 0.1, 0.04, 0.215, 0.5, 0, steel);
  stage.cylinder(0.06, 0.06, 0.09, 0, 1.4, 0, beaconMat, stage.group, 16);
  stage.cylinder(0.065, 0.065, 0.02, 0, 1.45, 0, dark, stage.group, 16);

  /* ═══ Mécanique interne : moto-réducteur, manivelle, ressort ═══ */
  stage.cylinder(0.08, 0.08, 0.2, -0.09, 0.52, 0, steel, stage.group, 18).rotation.x = Math.PI / 2;
  stage.box(0.18, 0.22, 0.18, -0.09, 0.75, 0, dark);
  stage.box(0.05, 0.06, 0.05, -0.09, 0.9, 0, steel);
  const crank = stage.group3(stage.group, 0.02, 1.08, 0);
  stage.box(0.22, 0.05, 0.05, -0.09, 0, 0.1, steel, crank);
  const spring = stage.group3(stage.group, 0.02, 0.62, -0.11);
  for (let i = 0; i < 11; i += 1) {
    stage.torus(0.055, 0.011, 0, i * 0.038, 0, steel, spring).rotation.x = Math.PI / 2;
  }
  [0.28, 1.06].forEach((y) => stage.box(0.05, 0.05, 0.05, 0.02, y, -0.11, dark));
  stage.box(0.02, 0.24, 0.2, -0.17, 0.86, 0, dark);
  for (let i = 0; i < 4; i += 1) {
    stage.box(0.008, 0.02, 0.02, -0.158, 0.94 - i * 0.05, 0.05, i === 0 ? greenLamp : panelMat);
  }

  /* ═══ Lisse : tube, bandes rétroréfléchissantes, bandeau lumineux ═══ */
  const boom = stage.group3(stage.group, 0.21, 1.18, 0);
  stage.box(0.14, 0.16, 0.14, 0, 0, 0, dark, boom);
  stage.box(3.36, 0.12, 0.11, 1.72, 0, 0, shellMat, boom);
  stage.box(3.36, 0.03, 0.13, 1.72, 0.05, 0, frameMat, boom);
  for (let i = 0; i < 8; i += 1) {
    stage.box(0.36, 0.1, 0.014, 0.24 + i * 0.42, 0, 0.058, i % 2 === 0 ? white : shellMat, boom);
  }
  stage.box(3.2, 0.018, 0.024, 1.72, -0.06, 0.05, boomLed, boom);
  stage.box(0.06, 0.14, 0.13, 3.42, 0, 0, dark, boom);
  stage.box(0.22, 0.1, 0.1, -0.16, 0, 0, frameMat, boom);
  stage.cylinder(0.05, 0.05, 0.16, 0, 0, 0, steel, boom, 16).rotation.x = Math.PI / 2;

  /* ═══ Chandelle de repos ═══ */
  stage.box(0.28, 0.1, 0.28, 3.62, 0.05, 0, concrete);
  stage.box(0.1, 0.98, 0.1, 3.62, 0.58, 0, frameMat);
  stage.box(0.16, 0.06, 0.2, 3.62, 1.1, 0, steel);
  [-0.08, 0.08].forEach((z) => stage.box(0.14, 0.12, 0.03, 3.62, 1.17, z, steel));

  /* ═══ Boucle de détection au sol et feu bicolore ═══ */
  const loopZ = -1.15;
  stage.box(1.7, 0.012, 0.03, 1.7, 0.02, loopZ - 0.5, loopMat);
  stage.box(1.7, 0.012, 0.03, 1.7, 0.02, loopZ + 0.5, loopMat);
  stage.box(0.03, 0.012, 1.03, 0.85, 0.02, loopZ, loopMat);
  stage.box(0.03, 0.012, 1.03, 2.55, 0.02, loopZ, loopMat);
  stage.box(0.14, 0.06, 0.14, 0.9, 0.03, loopZ + 0.5, dark);

  stage.box(0.1, 0.1, 0.1, -0.75, 0.05, 0.6, concrete);
  stage.box(0.08, 1.5, 0.08, -0.75, 0.8, 0.6, frameMat);
  stage.box(0.17, 0.36, 0.15, -0.75, 1.66, 0.6, shellMat);
  stage.cylinder(0.045, 0.045, 0.02, -0.75, 1.76, 0.68, redLamp, stage.group, 16).rotation.x = Math.PI / 2;
  stage.cylinder(0.045, 0.045, 0.02, -0.75, 1.58, 0.68, greenLamp, stage.group, 16).rotation.x = Math.PI / 2;
  stage.box(0.19, 0.03, 0.06, -0.75, 1.84, 0.66, frameMat);

  return {
    group: stage.group,
    parts: { boom, spring },
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
      /* Levée amortie en fin de course : la lisse ne claque jamais sur sa butée. */
      const eased = phase * phase * (3 - 2 * phase);
      boom.rotation.z = BOOM_UP * eased;
      crank.rotation.z = BOOM_UP * eased;
      // Le ressort se détend en levant : c'est lui qui équilibre la lisse.
      spring.scale.y = 1 - eased * 0.28;

      const moving = phase > 0.01 && phase < 0.99;
      beaconMat.emissiveIntensity = moving ? 1 + Math.abs(Math.sin(t / 240)) * 2.2 : 0.15;
      const openHex = eased > 0.85 ? 0x36d399 : 0xe30613;
      boomLed.color.setHex(openHex);
      boomLed.emissive.setHex(openHex);
      boomLed.emissiveIntensity = 1.4 + (moving ? Math.abs(Math.sin(t / 300)) * 1.2 : 0.6);
      redLamp.emissiveIntensity = eased > 0.85 ? 0.1 : 1.9;
      greenLamp.emissiveIntensity = eased > 0.85 ? 1.9 : 0.1;
      loopMat.emissiveIntensity = 0.25 + clamp01(phase * 4) * 1.5;
      panelMat.emissiveIntensity = 0.5 + phase * 1.4;
    },
    dispose: () => stage.dispose()
  };
}

export const BARRIER_PRODUCT: ProductDefinition = {
  id: 'barriere-levante',
  name: 'Barrière levante',
  reference: 'BAR-4',
  entity: 'FRELAR MÉTAL',
  category: 'metallique',
  glyph: 'barrier',
  tagline:
  'Lisse de 3,5 m équilibrée par ressort : moto-réducteur, manivelle et carter ouvert côté maintenance, avec boucle de détection au sol et feu bicolore.',
  target: [1.4, 0.9, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.66, phi: 0.22, radius: 7.4 },
  { id: 'face', label: 'Face', theta: 0, phi: 0.14, radius: 6.8 },
  { id: 'mecanisme', label: 'Mécanisme', theta: 2.5, phi: 0.24, radius: 2.6 },
  { id: 'boucle', label: 'Boucle au sol', theta: 0.5, phi: 0.8, radius: 6 },
  { id: 'plongee', label: 'Plongée', theta: 0.4, phi: 1.05, radius: 7 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'lisse', label: 'Lisse', value: '3 500 mm · tube aluminium bandé', position: [1.7, 0.06, 0.08], normal: [0, 0.4, 0.92], side: 'right', part: 'boom' },
  { id: 'ressort', label: 'Ressort d’équilibrage', value: 'Il porte la lisse ; le moteur ne fait que la déplacer', position: [0.02, 0.82, -0.18], normal: [-0.3, 0.2, -0.93], side: 'left' },
  { id: 'motoreducteur', label: 'Moto-réducteur', value: '200 W · levée en 2,5 s', position: [-0.09, 0.52, 0.14], normal: [-0.5, 0.1, 0.86], side: 'left' },
  { id: 'carte', label: 'Carte de commande', value: 'Détection d’effort · réouverture immédiate', position: [-0.17, 0.86, 0.12], normal: [-0.7, 0.2, 0.68], side: 'left' },
  { id: 'boucle', label: 'Boucle de détection', value: 'Interdit la descente sur véhicule présent', position: [1.7, 0.05, -0.6], normal: [0, 0.9, 0.44], side: 'right' },
  { id: 'bandeau', label: 'Bandeau lumineux', value: 'Rouge fermée, vert passage autorisé', position: [2.6, 1.1, 0.06], normal: [0, 0.2, 0.98], side: 'right' },
  { id: 'feu', label: 'Feu bicolore', value: 'Consigne visible à 30 m', position: [-0.75, 1.68, 0.7], normal: [-0.2, 0.2, 0.96], side: 'left' },
  { id: 'chandelle', label: 'Chandelle de repos', value: 'Soulage l’articulation à l’arrêt', position: [3.62, 1.16, 0.12], normal: [0.4, 0.4, 0.82], side: 'right' }],

  dimensions: [
  { id: 'lisse', value: 'Lisse 3 500 mm', from: [0.21, 1.32, 0], to: [3.62, 1.32, 0], bias: [0, -1] },
  { id: 'carter', value: 'Carter 1 320 mm', from: [-0.3, 0.14, 0], to: [-0.3, 1.32, 0], bias: [-1, 0] },
  { id: 'massif', value: 'Massif 660 mm', from: [-0.33, 0.14, 0.34], to: [0.33, 0.14, 0.34], bias: [0, 1] }],

  specs: [
  { label: 'Référence', value: 'BAR-4' },
  { label: 'Longueur de lisse', value: '3 500 mm' },
  { label: 'Temps de levée', value: '2,5 s · descente amortie' },
  { label: 'Moteur', value: '200 W · 24 V · usage intensif' },
  { label: 'Équilibrage', value: 'Ressort réglable sans dépose' },
  { label: 'Manœuvres', value: '2 000 cycles/jour' },
  { label: 'Sécurités', value: 'Boucle au sol · détection d’effort' },
  { label: 'Finition', value: 'Galvanisation + thermolaquage' }],

  demo: {
    idle: 'Lever la lisse',
    active: 'Abaisser la lisse',
    hint: 'Le ressort se détend, la lisse monte en 2,5 s, le bandeau passe au vert'
  },
  build
};
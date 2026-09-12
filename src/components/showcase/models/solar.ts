import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Centrale solaire « SOL-12 » — FRELAR ÉNERGIE.
 *
 * Une table sur suiveur mono-axe : douze modules portés par un tube de torsion
 * que la motorisation oriente au fil de la journée, puis la chaîne électrique
 * complète — coffret de raccordement, onduleur, batterie. La mise en service
 * sort la table de position de sécurité et lance la production.
 */
const COLUMNS = [-2.2, -1.32, -0.44, 0.44, 1.32, 2.2];
const PILES = [-2.64, -1.32, 0, 1.32, 2.64];

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}
interface Bead {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
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
  const CYAN = 0x4de0ff;
  const busMat = led(CYAN, 0.4, 0, 2200);
  const displayMat = led(CYAN, 0.6, 0, 3000);
  const okMat = led(0x36d399, 1.9, 0.3, 1900, 240);
  const alertMat = led(0xe30613, 2.2, 0.9, 900, 60);
  const amberMat = led(0xffa53d, 0.5, 0, 1600);

  /* ═══ Pieux battus, paliers, liaison équipotentielle ═══ */
  PILES.forEach((x) => {
    stage.box(0.4, 0.12, 0.4, x, 0.06, 0, concrete);
    stage.ibeam(1.32, 0.16, 0.13, 'y', x, 0.78, 0, frameMat);
    stage.box(0.24, 0.16, 0.3, x, 1.5, 0, shellMat);
    stage.cylinder(0.09, 0.09, 0.18, x, 1.56, 0, dark, stage.group, 18).rotation.z = Math.PI / 2;
    [-0.08, 0.08].forEach((z) => stage.cylinder(0.014, 0.014, 0.04, x, 1.42, z, steel, stage.group, 8));
    stage.box(0.02, 0.02, 0.02, x, 0.2, 0.16, steel);
  });
  const earth = new THREE.CatmullRomCurve3(PILES.map((x) => new THREE.Vector3(x, 0.2, 0.18)));
  stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(earth, 40, 0.012, 6, false)), steel));
  stage.contactShadow(8.4, 5.2, 0.4, 0);
  stage.rings(2.9, 0, 0);

  /* ═══ Table sur suiveur : tube de torsion, rails, douze modules ═══ */
  const tracker = stage.group3(stage.group, 0, 1.56, 0);
  stage.cylinder(0.055, 0.055, 5.5, 0, 0, 0, steel, tracker, 20).rotation.z = Math.PI / 2;
  for (let i = 0; i < 12; i += 1) {
    stage.torus(0.07, 0.012, -2.75 + i * 0.5, 0, 0, steel, tracker).rotation.y = Math.PI / 2;
  }
  const cells: THREE.MeshStandardMaterial[] = [];
  COLUMNS.forEach((x) => {
    stage.box(0.1, 0.05, 2.5, x, -0.04, 0, frameMat, tracker);
    [-0.62, 0.62].forEach((z) => stage.box(0.86, 0.04, 0.05, x, -0.075, z, frameMat, tracker));
    [-1, 1].forEach((side) => {
      const z = side * 0.62;
      stage.box(0.86, 0.035, 1.2, x, -0.02, z, frameMat, tracker);
      stage.box(0.82, 0.012, 1.16, x, 0, z, dark, tracker);
      for (let r = 0; r < 4; r += 1) {
        const cell = led(0x1b3a68, 0.15, 0, 3000);
        cells.push(cell);
        stage.box(0.78, 0.006, 0.25, x, 0.008, z - 0.42 + r * 0.28, cell, tracker);
      }
      stage.box(0.8, 0.006, 0.012, x, 0.012, z, busMat, tracker);
      stage.box(0.14, 0.05, 0.1, x, -0.06, z + 0.46, dark, tracker);
    });
  });
  // Motorisation d'orientation au centre du tube.
  stage.box(0.36, 0.34, 0.34, 0, -0.02, -0.32, shellMat, tracker);
  stage.cylinder(0.09, 0.09, 0.24, 0, -0.02, -0.58, dark, tracker, 18).rotation.x = Math.PI / 2;
  stage.box(0.12, 0.12, 0.06, 0, -0.02, -0.72, steel, tracker);
  stage.box(0.2, 0.06, 0.2, 0, 0.2, -0.32, dark, tracker);
  stage.box(0.16, 0.02, 0.14, 0, 0.24, -0.32, amberMat, tracker);
  stage.cylinder(0.05, 0.05, 0.06, 2.72, 0.06, 0, dark, tracker, 14);
  stage.cylinder(0.035, 0.035, 0.02, 2.72, 0.1, 0, busMat, tracker, 14);

  /* ═══ Coffret, onduleur, batterie ═══ */
  stage.box(0.5, 0.14, 0.5, 3.5, 0.07, 0.9, concrete);
  stage.box(0.09, 1.1, 0.09, 3.5, 0.62, 0.9, frameMat);
  stage.box(0.42, 0.5, 0.24, 3.5, 1.32, 0.9, shellMat);
  stage.box(0.02, 0.4, 0.18, 3.72, 1.32, 0.9, dark);
  [0.06, 0, -0.06].forEach((z, i) => {
    stage.cylinder(0.016, 0.016, 0.012, 3.735, 1.42, 0.9 + z, i === 2 ? alertMat : okMat, stage.group, 12).rotation.z = Math.PI / 2;
  });

  const inverter = stage.group3(stage.group, 4.4, 0, 0.1);
  stage.box(1, 0.16, 0.7, 0, 0.08, 0, concrete, inverter);
  stage.box(0.84, 1.5, 0.46, 0, 0.91, 0, shellMat, inverter);
  stage.box(0.88, 0.06, 0.5, 0, 1.69, 0, frameMat, inverter);
  stage.box(0.03, 1.32, 0.4, 0.43, 0.91, 0, dark, inverter);
  stage.box(0.01, 0.26, 0.3, 0.448, 1.42, 0, displayMat, inverter);
  for (let i = 0; i < 5; i += 1) {
    stage.box(0.012, 0.05, 0.05, 0.448, 1.16 - i * 0.08, -0.1, i < 4 ? okMat : dark, inverter);
  }
  for (let i = 0; i < 16; i += 1) {
    stage.box(0.03, 0.9, 0.012, -0.44, 0.86, -0.22 + i * 0.03, steel, inverter);
  }

  const battery = stage.group3(stage.group, 4.4, 0, -1.5);
  stage.box(1.1, 0.16, 0.8, 0, 0.08, 0, concrete, battery);
  stage.box(0.94, 1.36, 0.62, 0, 0.84, 0, shellMat, battery);
  stage.box(0.98, 0.06, 0.66, 0, 1.55, 0, frameMat, battery);
  const chargeLeds: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 5; i += 1) {
    const y = 0.34 + i * 0.24;
    stage.box(0.86, 0.2, 0.03, 0, y, 0.32, dark, battery);
    stage.box(0.8, 0.14, 0.02, 0, y, 0.335, frameMat, battery);
    const lamp = led(0x14304a, 0.05, 0, 3000);
    chargeLeds.push(lamp);
    stage.box(0.1, 0.03, 0.012, 0.32, y, 0.35, lamp, battery);
  }

  /* ═══ Chaîne électrique et flux d'énergie ═══ */
  const beads: Bead[] = [];
  const runs: THREE.Vector3[][] = [
  [new THREE.Vector3(2.2, 1.5, 0.6), new THREE.Vector3(2.9, 1, 0.85), new THREE.Vector3(3.5, 1.28, 0.9)],
  [new THREE.Vector3(3.5, 1.28, 0.9), new THREE.Vector3(4, 0.9, 0.6), new THREE.Vector3(4.4, 1.1, 0.34)],
  [new THREE.Vector3(4.4, 0.5, 0.1), new THREE.Vector3(4.4, 0.32, -0.7), new THREE.Vector3(4.4, 0.6, -1.2)]];

  runs.forEach((points, index) => {
    const curve = new THREE.CatmullRomCurve3(points);
    stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(curve, 30, 0.026, 7, false)), dark));
    for (let i = 0; i < 3; i += 1) {
      beads.push({ mesh: stage.sphere(0.045, 0, 0, 0, busMat), curve, offset: i / 3 + index * 0.12 });
    }
  });
  const drop = new THREE.CatmullRomCurve3([
  new THREE.Vector3(2.2, 1.5, 0.62),
  new THREE.Vector3(2.5, 0.9, 0.5),
  new THREE.Vector3(2.64, 0.3, 0.2)]
  );
  stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(drop, 26, 0.02, 6, false)), dark));

  return {
    group: stage.group,
    parts: { tracker, inverter, battery },
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
      /* Sortie de position de sécurité puis suivi : la table quitte
         l'horizontale et se met à balayer lentement, comme sur une journée. */
      const armed = clamp01(phase / 0.35);
      const track = clamp01((phase - 0.25) / 0.75);
      tracker.rotation.x = armed * (-0.34 + Math.sin(t / 9000) * 0.42 * track);

      const output = 0.15 + track * (1.5 + Math.sin(t / 2600) * 0.2);
      cells.forEach((cell, index) => {
        cell.emissiveIntensity = output * (0.85 + 0.3 * Math.sin((t + index * 240) / 3200));
      });
      busMat.emissiveIntensity = 0.3 + track * 2;
      displayMat.emissiveIntensity = 0.4 + track * 1.8;
      amberMat.emissiveIntensity = 0.3 + armed * 1.6;

      beads.forEach((bead) => {
        const travel = ((t * (0.00006 + track * 0.00028) + bead.offset) % 1 + 1) % 1;
        bead.mesh.position.copy(bead.curve.getPoint(travel));
        bead.mesh.visible = track > 0.08;
        bead.mesh.scale.setScalar(0.5 + track * 0.8);
      });
      chargeLeds.forEach((lamp, index) => {
        const on = track > index / chargeLeds.length;
        const hex = on ? 0x36d399 : 0x14304a;
        lamp.color.setHex(hex);
        lamp.emissive.setHex(hex);
        lamp.emissiveIntensity = on ? 1.8 : 0.05;
      });
    },
    dispose: () => stage.dispose()
  };
}

export const SOLAR_PRODUCT: ProductDefinition = {
  id: 'centrale-solaire',
  name: 'Centrale solaire',
  reference: 'SOL-12',
  entity: 'FRELAR ÉNERGIE',
  category: 'technique',
  glyph: 'solar',
  tagline:
  'Table de douze modules sur suiveur mono-axe, coffret de raccordement, onduleur et batterie : la chaîne solaire complète, du verre au stockage.',
  target: [1, 1.2, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.68, phi: 0.26, radius: 8.6 },
  { id: 'table', label: 'Table', theta: 0, phi: 0.18, radius: 7.2 },
  { id: 'suiveur', label: 'Motorisation', theta: 3.1, phi: 0.24, radius: 4.6 },
  { id: 'electrique', label: 'Chaîne électrique', theta: 1.2, phi: 0.24, radius: 5.4 },
  { id: 'plongee', label: 'Plongée', theta: 0.4, phi: 1, radius: 8.4 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'modules', label: 'Modules photovoltaïques', value: '12 × 580 Wc · 6,96 kWc', position: [-1.32, 1.62, 0.62], normal: [-0.2, 0.8, 0.57], side: 'left' },
  { id: 'tube', label: 'Tube de torsion', value: 'Suiveur mono-axe · ± 55°', position: [0.88, 1.56, 0], normal: [0.1, 0.6, 0.79], side: 'right' },
  { id: 'motorisation', label: 'Motorisation', value: 'Vérin rotatif · mise en sécurité au vent', position: [0, 1.5, -0.62], normal: [0, 0.4, -0.92], side: 'left' },
  { id: 'pieux', label: 'Pieux battus', value: 'Sans génie civil · profondeur 1,6 m', position: [-2.64, 0.6, 0.14], normal: [-0.6, 0.2, 0.77], side: 'left' },
  { id: 'coffret', label: 'Coffret de raccordement', value: 'Parafoudre · sectionneur · fusibles', position: [3.74, 1.4, 0.9], normal: [0.8, 0.3, 0.52], side: 'right' },
  { id: 'onduleur', label: 'Onduleur', value: '8 kVA · suivi de point de puissance', position: [4.85, 1.4, 0.1], normal: [0.8, 0.4, 0.45], side: 'right' },
  { id: 'batterie', label: 'Stockage', value: '5 modules · 25 kWh utiles', position: [4.4, 1.3, -1.16], normal: [0.2, 0.5, 0.84], side: 'right' },
  { id: 'terre', label: 'Liaison équipotentielle', value: 'Tous les pieux reliés · prise de terre unique', position: [-1.32, 0.22, 0.18], normal: [-0.3, 0.6, 0.74], side: 'left' }],

  dimensions: [
  { id: 'table', value: 'Table 5 500 mm', from: [-2.75, 1.56, 1.3], to: [2.75, 1.56, 1.3], bias: [0, -1] },
  { id: 'hauteur', value: 'Axe à 1 560 mm', from: [-3, 0, 0], to: [-3, 1.56, 0], bias: [-1, 0] },
  { id: 'largeur', value: 'Deux rangées · 2 500 mm', from: [2.2, 1.5, -1.25], to: [2.2, 1.5, 1.25], bias: [1, 0] }],

  specs: [
  { label: 'Référence', value: 'SOL-12' },
  { label: 'Puissance crête', value: '6,96 kWc · 12 modules' },
  { label: 'Suiveur', value: 'Mono-axe ± 55° · pilotage astronomique' },
  { label: 'Production', value: '11,4 MWh/an estimés' },
  { label: 'Onduleur', value: '8 kVA · rendement 98,2 %' },
  { label: 'Stockage', value: '25 kWh utiles · 6 000 cycles' },
  { label: 'Mise en sécurité', value: 'Mise à plat automatique au-delà de 60 km/h' },
  { label: 'Fondations', value: 'Pieux battus · pas de béton' }],

  demo: {
    idle: 'Lancer la production',
    active: 'Mettre en sécurité',
    hint: 'La table quitte l’horizontale, se met à suivre, et le stockage se charge'
  },
  build
};
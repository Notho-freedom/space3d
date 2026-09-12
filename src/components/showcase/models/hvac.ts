import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Climatisation de précision « CLM-40 » — FRELAR ÉNERGIE.
 *
 * L'armoire souffle sous le plancher technique, l'air remonte par la dalle
 * perforée, traverse la salle et revient par la reprise haute : la maquette
 * rend visible cette boucle, qui est tout le sujet d'une clim de précision.
 */
const FLOOR_Y = 0.62;

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
  const frameMat = stage.standard(0x7f95a7, 0.96, 0.34);
  const steel = stage.standard(0xa8bccb, 1, 0.22);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const insul = stage.standard(0x14202f, 0.2, 0.9);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const displayMat = led(0x4de0ff, 0.6, 0, 3000);
  const coldMat = led(0x5fd4ff, 0.4, 0, 2400);
  const okMat = led(0x36d399, 1.9, 0.35, 1900, 240);
  const alertMat = led(0xe30613, 2.2, 0.9, 900, 60);
  const airMat = stage.mat(
    new THREE.MeshBasicMaterial({ color: 0x7fdcff, transparent: true, opacity: 0.4, depthWrite: false })
  );

  /* ═══ Plancher technique et plénum ═══ */
  stage.box(4.5, 0.1, 2.5, 1.1, FLOOR_Y - 0.05, 0, frameMat);
  stage.box(4.3, 0.02, 2.3, 1.1, FLOOR_Y + 0.011, 0, dark);
  for (let i = 0; i < 6; i += 1) {
    const x = -0.9 + i * 0.84;
    [-1.05, 0, 1.05].forEach((z) => {
      stage.cylinder(0.035, 0.045, FLOOR_Y - 0.1, x, (FLOOR_Y - 0.1) / 2, z, steel, stage.group, 10);
      stage.box(0.14, 0.02, 0.14, x, 0.012, z, frameMat);
    });
  }
  // Dalle perforée : c'est par là que l'air froid entre dans la salle.
  stage.box(0.68, 0.02, 0.68, 1.75, FLOOR_Y + 0.005, 0, frameMat);
  stage.box(0.62, 0.03, 0.62, 1.75, FLOOR_Y + 0.015, 0, dark);
  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      stage.box(0.055, 0.012, 0.055, 1.53 + c * 0.088, FLOOR_Y + 0.03, -0.22 + r * 0.088, coldMat);
    }
  }
  stage.box(0.03, 0.5, 2.5, 3.34, 0.36, 0, frameMat);
  stage.contactShadow(7.6, 4.4, 1, 0);
  stage.rings(2.5, 0.8, 0);

  /* ═══ Armoire intérieure ═══ */
  const unit = stage.group3(stage.group, -1.25, 0, 0);
  stage.box(1.06, 0.16, 0.9, 0, 0.08, 0, frameMat, unit);
  stage.box(1, 2, 0.82, 0, 1.16, 0, shellMat, unit);
  stage.box(1.04, 0.05, 0.86, 0, 2.19, 0, frameMat, unit);
  stage.box(0.035, 1.86, 0.76, 0.51, 1.16, 0, dark, unit);
  for (let i = 0; i < 14; i += 1) {
    const slat = stage.box(0.02, 0.05, 0.7, 0.535, 0.42 + i * 0.075, 0, frameMat, unit);
    slat.rotation.z = 0.35;
  }
  stage.box(0.03, 0.34, 0.34, 0.53, 1.95, 0, dark, unit);
  stage.box(0.01, 0.2, 0.26, 0.549, 1.98, 0, displayMat, unit);
  [0.06, -0.02, -0.1].forEach((z, i) => {
    stage.cylinder(0.018, 0.018, 0.012, 0.549, 1.8, z, i === 0 ? okMat : i === 1 ? coldMat : alertMat, unit, 12).rotation.z = Math.PI / 2;
  });
  stage.box(0.05, 0.24, 0.03, 0.545, 1.2, 0.3, steel, unit);
  // Reprise haute.
  stage.box(0.86, 0.03, 0.68, 0, 2.17, 0, dark, unit);
  for (let i = 0; i < 9; i += 1) stage.box(0.8, 0.016, 0.04, 0, 2.19, -0.28 + i * 0.07, steel, unit);
  // Flanc ouvert : filtre, batterie à ailettes, bac de condensats.
  stage.box(0.9, 0.24, 0.03, 0, 1.94, -0.42, dark, unit);
  for (let i = 0; i < 22; i += 1) stage.box(0.03, 0.62, 0.012, -0.42 + i * 0.04, 1.42, -0.415, steel, unit);
  stage.box(0.92, 0.06, 0.05, 0, 1.08, -0.415, frameMat, unit);
  stage.box(0.86, 0.05, 0.16, 0, 0.98, -0.36, dark, unit);
  // Ventilateurs à commutation électronique, en soufflage vers le plénum.
  const fans: THREE.Group[] = [];
  [-0.24, 0.24].forEach((z) => {
    const holder = stage.group3(unit, 0, 0.3, z);
    stage.torus(0.2, 0.02, 0, 0, 0, steel, holder).rotation.x = Math.PI / 2;
    stage.cylinder(0.06, 0.06, 0.06, 0, 0, 0, dark, holder, 14);
    for (let b = 0; b < 7; b += 1) {
      const blade = stage.box(0.17, 0.02, 0.06, 0.1, 0, 0, steel, holder);
      blade.rotation.y = b / 7 * Math.PI * 2;
      blade.rotation.x = 0.4;
    }
    fans.push(holder);
  });
  stage.box(0.98, 0.02, 0.78, 0, 0.44, 0, dark, unit);

  /* ═══ Groupe extérieur ═══ */
  const outdoor = stage.group3(stage.group, 3.9, 0, 0);
  [-0.5, 0.5].forEach((x) => {
    [-0.28, 0.28].forEach((z) => stage.box(0.08, 0.4, 0.08, x, 0.2, z, frameMat, outdoor));
  });
  stage.box(1.3, 0.06, 0.76, 0, 0.42, 0, frameMat, outdoor);
  stage.box(1.26, 0.86, 0.72, 0, 0.88, 0, shellMat, outdoor);
  [-0.37, 0.37].forEach((z) => {
    for (let i = 0; i < 26; i += 1) stage.box(0.012, 0.74, 0.03, -0.58 + i * 0.046, 0.88, z, steel, outdoor);
  });
  stage.box(1.3, 0.05, 0.8, 0, 1.33, 0, frameMat, outdoor);
  const outdoorFans: THREE.Group[] = [];
  [-0.3, 0.3].forEach((x) => {
    const holder = stage.group3(outdoor, x, 1.37, 0);
    stage.cylinder(0.05, 0.05, 0.05, 0, 0, 0, dark, holder, 14);
    for (let b = 0; b < 5; b += 1) {
      const blade = stage.box(0.2, 0.015, 0.07, 0.11, 0.01, 0, steel, holder);
      blade.rotation.y = b / 5 * Math.PI * 2;
      blade.rotation.x = 0.35;
    }
    [0.14, 0.22, 0.28].forEach((r) => stage.torus(r, 0.007, x, 1.4, 0, steel, outdoor).rotation.x = Math.PI / 2);
    for (let s = 0; s < 4; s += 1) {
      const spoke = stage.box(0.56, 0.008, 0.012, x, 1.4, 0, steel, outdoor);
      spoke.rotation.y = s / 4 * Math.PI;
    }
    outdoorFans.push(holder);
  });
  stage.cylinder(0.16, 0.16, 0.34, -0.3, 0.62, 0, dark, outdoor, 18);
  stage.cylinder(0.09, 0.09, 0.28, 0.34, 0.6, -0.2, steel, outdoor, 14);

  /* ═══ Liaison frigorifique ═══ */
  const liquid = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.25, 2.24, -0.2),
  new THREE.Vector3(-0.4, 2.7, -0.62),
  new THREE.Vector3(2.4, 2.7, -0.62),
  new THREE.Vector3(3.6, 1.45, -0.25)]
  );
  const suction = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.25, 2.24, 0.2),
  new THREE.Vector3(-0.4, 2.56, 0.62),
  new THREE.Vector3(2.4, 2.56, 0.62),
  new THREE.Vector3(3.6, 1.45, 0.25)]
  );
  [liquid, suction].forEach((curve, index) => {
    stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(curve, 60, index === 0 ? 0.05 : 0.07, 9, false)), insul));
  });
  for (let i = 0; i < 7; i += 1) {
    const t = 0.12 + i * 0.13;
    [liquid, suction].forEach((curve) => {
      const point = curve.getPoint(t);
      stage.box(0.03, 0.16, 0.16, point.x, point.y + 0.02, point.z, steel);
    });
  }
  const drier = liquid.getPoint(0.62);
  stage.cylinder(0.07, 0.07, 0.2, drier.x, drier.y, drier.z, steel, stage.group, 16).rotation.z = Math.PI / 2;
  stage.cylinder(0.045, 0.045, 0.05, drier.x + 0.24, drier.y, drier.z, coldMat, stage.group, 12).rotation.z = Math.PI / 2;

  /* ═══ Boucle d'air : soufflage bas, reprise haute ═══ */
  const airPath = new THREE.CatmullRomCurve3(
    [
    new THREE.Vector3(-1.25, 0.28, 0),
    new THREE.Vector3(0.2, 0.26, 0),
    new THREE.Vector3(1.75, 0.3, 0),
    new THREE.Vector3(1.75, 1.5, 0),
    new THREE.Vector3(1.6, 2.32, 0),
    new THREE.Vector3(0.2, 2.42, 0),
    new THREE.Vector3(-1.25, 2.34, 0)],

    true
  );
  stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(airPath, 90, 0.006, 5, true)), airMat));
  const beads = Array.from({ length: 10 }, (_, i) => ({
    mesh: stage.sphere(0.045, 0, 0, 0, airMat),
    offset: i / 10
  }));

  return {
    group: stage.group,
    parts: { unit, outdoor },
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
      /* Les ventilateurs montent d'abord, la boucle d'air ensuite — c'est
         l'ordre réel, l'air ne circule pas avant que ça tourne. */
      const spin = clamp01(phase / 0.4);
      const flow = clamp01((phase - 0.2) / 0.6);
      fans.forEach((fan, index) => {
        fan.rotation.y = t / (900 - spin * 830) % (Math.PI * 2) * (index === 0 ? 1 : -1);
      });
      outdoorFans.forEach((fan, index) => {
        fan.rotation.y = t / (1100 - spin * 950) % (Math.PI * 2) * (index === 0 ? -1 : 1);
      });
      beads.forEach((bead) => {
        const travel = ((t * (0.00004 + flow * 0.00016) + bead.offset) % 1 + 1) % 1;
        bead.mesh.position.copy(airPath.getPoint(travel));
        bead.mesh.scale.setScalar(0.4 + flow * 0.9);
      });
      airMat.opacity = 0.1 + flow * 0.5;
      coldMat.emissiveIntensity = 0.25 + flow * 1.9;
      displayMat.emissiveIntensity = 0.4 + phase * 1.7;
    },
    dispose: () => stage.dispose()
  };
}

export const HVAC_PRODUCT: ProductDefinition = {
  id: 'climatisation-precision',
  name: 'Climatisation de précision',
  reference: 'CLM-40',
  entity: 'FRELAR ÉNERGIE',
  category: 'technique',
  glyph: 'hvac',
  tagline:
  'Soufflage sous plancher, remontée par dalle perforée, reprise haute : la boucle d’air complète d’une salle technique, avec groupe extérieur et liaison frigorifique.',
  target: [0.9, 1.2, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.66, phi: 0.22, radius: 7.4 },
  { id: 'boucle', label: 'Boucle d’air', theta: 1.57, phi: 0.16, radius: 7 },
  { id: 'armoire', label: 'Armoire', theta: -0.5, phi: 0.2, radius: 4.4 },
  { id: 'groupe', label: 'Groupe extérieur', theta: 0.9, phi: 0.26, radius: 4.6 },
  { id: 'plongee', label: 'Plongée', theta: 0.5, phi: 0.9, radius: 7.6 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'armoire', label: 'Armoire de soufflage', value: '40 kW froid · débit 9 000 m³/h', position: [-1.25, 2.3, 0.3], normal: [-0.2, 0.6, 0.77], side: 'left' },
  { id: 'ventilateurs', label: 'Ventilateurs à commutation', value: 'Débit modulé · 30 % d’énergie économisée', position: [-1.25, 0.3, 0.5], normal: [0.2, 0.2, 0.96], side: 'left' },
  { id: 'plenum', label: 'Plénum sous plancher', value: 'Pression maîtrisée · pas de point chaud', position: [1, 0.3, 1.2], normal: [0, 0.3, 0.95], side: 'right' },
  { id: 'dalle', label: 'Dalle perforée', value: '55 % de taux d’ouverture · air à 18 °C', position: [1.75, 0.66, 0.3], normal: [0, 0.9, 0.44], side: 'right' },
  { id: 'reprise', label: 'Reprise haute', value: 'Air chaud repris à 32 °C', position: [-1.25, 2.24, -0.2], normal: [0, 0.9, -0.44], side: 'left' },
  { id: 'batterie', label: 'Batterie à ailettes', value: 'Détente directe · déshumidification maîtrisée', position: [-1.25, 1.42, -0.44], normal: [-0.3, 0.2, -0.93], side: 'left' },
  { id: 'liaison', label: 'Liaison frigorifique', value: 'Lignes isolées · déshydrateur et voyant', position: [1.2, 2.6, -0.62], normal: [0, 0.7, -0.71], side: 'right' },
  { id: 'groupe', label: 'Groupe extérieur', value: 'Compresseur à vitesse variable · 2 ventilateurs', position: [3.9, 1.42, 0.4], normal: [0.4, 0.5, 0.77], side: 'right' }],

  dimensions: [
  { id: 'hauteur', value: 'Armoire 2 200 mm', from: [-1.9, 0, 0.42], to: [-1.9, 2.2, 0.42], bias: [-1, 0] },
  { id: 'plancher', value: 'Plénum 620 mm', from: [3.4, 0, 0.8], to: [3.4, 0.62, 0.8], bias: [1, 0] },
  { id: 'dalle', value: 'Dalle 600 × 600', from: [1.44, 0.65, 0.31], to: [2.06, 0.65, 0.31], bias: [0, 1] }],

  specs: [
  { label: 'Référence', value: 'CLM-40' },
  { label: 'Puissance froid', value: '40 kW sensibles' },
  { label: 'Débit d’air', value: '9 000 m³/h modulés' },
  { label: 'Distribution', value: 'Soufflage sous plancher · reprise haute' },
  { label: 'Précision', value: '± 1 °C · ± 5 % d’humidité' },
  { label: 'Compresseur', value: 'Vitesse variable · démarrage progressif' },
  { label: 'Filtration', value: 'Classe ePM1 · manque de filtre signalé' },
  { label: 'Redondance', value: 'Deux armoires en rotation hebdomadaire' }],

  demo: {
    idle: 'Lancer le cycle de froid',
    active: 'Arrêter le cycle',
    hint: 'Les ventilateurs montent d’abord, puis la boucle d’air s’installe dans la salle'
  },
  build
};
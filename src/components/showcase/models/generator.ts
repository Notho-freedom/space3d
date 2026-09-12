import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Groupe électrogène « GEN-250 » — FRELAR ÉNERGIE.
 *
 * Skid ouvert, pour qu'on voie la chaîne complète : réservoir intégré, moteur
 * six cylindres, radiateur soufflant, alternateur, échappement et armoire de
 * commande. La mise en service joue le démarrage réel — préchauffage,
 * lancement, montée en régime, prise de charge.
 */
interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}
interface Puff {
  mesh: THREE.Mesh;
  offset: number;
}

function build(): BuiltModel {
  const stage = new Stage();
  const shellMat = stage.standard(0x8ea3b4, 0.96, 0.3);
  const frameMat = stage.standard(0x7f95a7, 0.96, 0.34);
  const steel = stage.standard(0xa8bccb, 1, 0.22);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const rubber = stage.standard(0x0c0f14, 0.2, 0.9);
  const copper = stage.standard(0xb87333, 0.9, 0.36);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const displayMat = led(0x4de0ff, 0.5, 0, 3000);
  const alertMat = led(0xe30613, 2.2, 0.9, 900, 60);
  const okMat = led(0x36d399, 0.4, 0, 1900);
  const amberMat = led(0xffa53d, 0.4, 0, 1500);
  const smokeMat = stage.mat(
    new THREE.MeshBasicMaterial({ color: 0x6b7d8f, transparent: true, opacity: 0, depthWrite: false })
  );

  /* ═══ Châssis-réservoir : longerons, cuve, plots antivibratoires ═══ */
  [-0.52, 0.52].forEach((z) => stage.ibeam(3.3, 0.18, 0.14, 'x', 0, 0.12, z, frameMat));
  [-1.5, -0.5, 0.5, 1.5].forEach((x) => stage.box(0.1, 0.14, 1.06, x, 0.12, 0, frameMat));
  stage.box(3.14, 0.44, 1.12, 0, 0.44, 0, shellMat);
  stage.box(3.16, 0.03, 1.14, 0, 0.67, 0, frameMat);
  stage.cylinder(0.11, 0.11, 0.07, 1.0, 0.71, -0.36, dark, stage.group, 18);
  stage.cylinder(0.09, 0.09, 0.03, 1.0, 0.75, -0.36, steel, stage.group, 6);
  stage.box(0.1, 0.22, 0.03, 1.45, 0.5, 0.57, dark);
  stage.box(0.05, 0.16, 0.012, 1.45, 0.5, 0.588, amberMat);
  stage.cylinder(0.02, 0.02, 0.16, 0.6, 0.78, -0.36, steel, stage.group, 10);
  stage.cylinder(0.035, 0.035, 0.09, -1.3, 0.34, 0.58, steel, stage.group, 12).rotation.x = Math.PI / 2;
  [-1.35, 1.35].forEach((x) => {
    [-0.52, 0.52].forEach((z) => {
      stage.box(0.22, 0.03, 0.22, x, 0.015, z, steel);
      stage.cylinder(0.07, 0.07, 0.06, x, 0.05, z, rubber, stage.group, 14);
      stage.cylinder(0.03, 0.03, 0.05, x, 0.09, z, steel, stage.group, 10);
    });
  });
  stage.contactShadow(6.4, 4.4, 0, 0);
  stage.rings(2.15, 0, 0);

  /* ═══ Moteur six cylindres ═══ */
  const engine = stage.group3(stage.group, -0.08, 0, 0);
  stage.box(1.3, 0.2, 0.68, 0, 0.79, 0, dark, engine);
  stage.box(1.36, 0.6, 0.8, 0, 1.16, 0, shellMat, engine);
  stage.box(1.24, 0.12, 0.72, 0, 1.5, 0, frameMat, engine);
  stage.box(1.1, 0.16, 0.36, 0, 1.62, -0.02, shellMat, engine);
  for (let i = 0; i < 6; i += 1) {
    const x = -0.45 + i * 0.18;
    stage.cylinder(0.035, 0.035, 0.05, x, 1.72, -0.02, steel, engine, 12);
    stage.cylinder(0.018, 0.018, 0.12, x, 1.78, -0.02, steel, engine, 8);
    stage.box(0.012, 0.012, 0.2, x, 1.79, 0.08, steel, engine);
    const stub = stage.cylinder(0.045, 0.045, 0.16, x, 1.3, 0.46, dark, engine, 12);
    stub.rotation.x = Math.PI / 2;
  }
  stage.cylinder(0.03, 0.03, 1.12, 0, 1.79, 0.18, steel, engine, 10).rotation.z = Math.PI / 2;
  stage.cylinder(0.07, 0.07, 1.1, 0, 1.3, 0.54, dark, engine, 14).rotation.z = Math.PI / 2;
  // Turbocompresseur, filtres, démarreur.
  stage.sphere(0.13, -0.62, 1.34, 0.62, steel, engine);
  stage.cylinder(0.09, 0.12, 0.14, -0.62, 1.34, 0.78, dark, engine, 16).rotation.x = Math.PI / 2;
  stage.cylinder(0.075, 0.075, 0.2, 0.5, 1.0, 0.44, dark, engine, 16).rotation.x = 0.2;
  [0.26, 0.4].forEach((x) => stage.cylinder(0.05, 0.05, 0.18, x, 1.02, -0.46, dark, engine, 14));
  stage.cylinder(0.08, 0.08, 0.24, 0.42, 0.86, -0.42, steel, engine, 16).rotation.z = Math.PI / 2;
  stage.box(0.06, 0.06, 0.06, 0.58, 0.86, -0.42, amberMat, engine);
  stage.cylinder(0.012, 0.012, 0.3, 0.62, 1.28, -0.3, steel, engine, 6);
  // Poulies et courroie, côté radiateur.
  const belt = stage.group3(engine, -0.76, 1.16, 0);
  [0.2, 0.14, 0.09].forEach((radius, i) => {
    const pulley = stage.cylinder(radius, radius, 0.05, 0, i === 0 ? 0 : i === 1 ? 0.3 : -0.24, i === 2 ? 0.24 : 0, steel, belt, 22);
    pulley.rotation.z = Math.PI / 2;
  });
  stage.torus(0.26, 0.018, 0, 0.08, 0, rubber, belt).rotation.y = Math.PI / 2;

  /* ═══ Radiateur soufflant ═══ */
  const radiator = stage.group3(stage.group, -1.42, 0, 0);
  stage.box(0.2, 1.18, 1.06, 0, 1.14, 0, frameMat, radiator);
  for (let i = 0; i < 18; i += 1) {
    stage.box(0.14, 0.94, 0.012, 0, 1.14, -0.48 + i * 0.056, steel, radiator);
  }
  [1.75, 0.55].forEach((y) => stage.box(0.24, 0.12, 1.1, 0, y, 0, shellMat, radiator));
  stage.cylinder(0.06, 0.06, 0.06, 0, 1.84, 0.3, dark, radiator, 14);
  [0.4, -0.34].forEach((z, i) => {
    stage.cylinder(0.055, 0.055, 0.5, 0.42, 1.5 - i * 0.7, z, rubber, radiator, 12).rotation.z = Math.PI / 2;
  });
  const fan = stage.group3(radiator, 0.26, 1.14, 0);
  stage.cylinder(0.09, 0.09, 0.1, 0, 0, 0, dark, fan, 16).rotation.z = Math.PI / 2;
  for (let b = 0; b < 7; b += 1) {
    const blade = stage.box(0.03, 0.44, 0.1, 0.03, 0, 0, steel, fan);
    blade.rotation.x = b / 7 * Math.PI * 2;
    blade.rotation.z = 0.34;
  }
  [0.2, 0.34, 0.46].forEach((r) => stage.torus(r, 0.008, 0.36, 1.14, 0, steel, radiator).rotation.y = Math.PI / 2);
  for (let s = 0; s < 6; s += 1) {
    const spoke = stage.box(0.008, 0.94, 0.012, 0.36, 1.14, 0, steel, radiator);
    spoke.rotation.x = s / 6 * Math.PI;
  }

  /* ═══ Alternateur et sortie de puissance ═══ */
  const alternator = stage.group3(stage.group, 1.15, 0, 0);
  stage.cylinder(0.38, 0.38, 0.86, 0, 1.14, 0, shellMat, alternator, 28).rotation.z = Math.PI / 2;
  for (let i = 0; i < 14; i += 1) {
    const a = i / 14 * Math.PI * 2;
    stage.box(0.6, 0.03, 0.05, 0, 1.14 + Math.sin(a) * 0.38, Math.cos(a) * 0.38, dark, alternator);
  }
  [-0.45, 0.45].forEach((x) => stage.cylinder(0.4, 0.4, 0.06, x, 1.14, 0, frameMat, alternator, 28).rotation.z = Math.PI / 2);
  stage.box(0.44, 0.34, 0.4, 0.05, 1.63, 0, shellMat, alternator);
  stage.box(0.4, 0.02, 0.36, 0.05, 1.81, 0, frameMat, alternator);
  [-0.12, 0, 0.12].forEach((z) => stage.cylinder(0.03, 0.03, 0.12, 0.05, 1.55, z, copper, alternator, 10));
  [-0.1, 0.02, 0.14].forEach((z, i) => {
    const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.2, 1.5, z),
    new THREE.Vector3(1.5, 1.2, z + 0.2),
    new THREE.Vector3(1.62, 0.95, 0.34)]
    );
    stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(curve, 22, 0.024, 6, false)), i === 2 ? copper : dark));
  });

  /* ═══ Filtration d'air et échappement ═══ */
  stage.cylinder(0.19, 0.19, 0.44, -0.2, 1.92, -0.42, shellMat, stage.group, 22).rotation.z = Math.PI / 2;
  stage.cylinder(0.2, 0.2, 0.04, -0.42, 1.92, -0.42, dark, stage.group, 22).rotation.z = Math.PI / 2;
  const intake = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.02, 1.92, -0.42),
  new THREE.Vector3(-0.3, 1.86, 0.2),
  new THREE.Vector3(-0.7, 1.62, 0.6)]
  );
  stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(intake, 26, 0.06, 8, false)), rubber));
  const exhaust = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.48, 1.3, 0.54),
  new THREE.Vector3(0.72, 1.62, 0.62),
  new THREE.Vector3(0.72, 1.95, 0.62)]
  );
  stage.group.add(new THREE.Mesh(stage.own(new THREE.TubeGeometry(exhaust, 24, 0.07, 8, false)), dark));
  for (let i = 0; i < 5; i += 1) {
    stage.torus(0.075, 0.012, 0.72, 1.72 + i * 0.035, 0.62, steel).rotation.x = Math.PI / 2;
  }
  stage.cylinder(0.19, 0.19, 0.92, 0.28, 2.14, 0.62, shellMat, stage.group, 22).rotation.z = Math.PI / 2;
  [-0.14, 0.14].forEach((x) => stage.torus(0.2, 0.014, 0.28 + x, 2.14, 0.62, steel).rotation.y = Math.PI / 2);
  stage.cylinder(0.09, 0.09, 0.5, -0.24, 2.36, 0.62, dark, stage.group, 16);
  stage.cylinder(0.13, 0.06, 0.08, -0.24, 2.63, 0.62, steel, stage.group, 16);
  [0.1, 0.46].forEach((x) => stage.box(0.05, 0.4, 0.05, x, 1.94, 0.62, frameMat));

  const puffs: Puff[] = [];
  for (let i = 0; i < 4; i += 1) {
    puffs.push({ mesh: stage.sphere(0.11, -0.24, 2.7, 0.62, smokeMat), offset: i / 4 });
  }

  /* ═══ Armoire de commande, disjoncteur, batterie ═══ */
  const panel = stage.group3(stage.group, 1.32, 0, -0.6);
  stage.box(0.08, 1.0, 0.08, 0, 1.0, 0, frameMat, panel);
  stage.box(0.56, 0.68, 0.34, 0.1, 1.72, 0, shellMat, panel);
  stage.box(0.03, 0.6, 0.3, 0.39, 1.72, 0, dark, panel);
  stage.box(0.008, 0.22, 0.24, 0.408, 1.88, 0, displayMat, panel);
  const lamps: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 4; i += 1) {
    const lampMat = led(0x14304a, 0.05, 0, 3000);
    lamps.push(lampMat);
    stage.cylinder(0.022, 0.022, 0.012, 0.408, 1.68, -0.09 + i * 0.06, lampMat, panel, 14).rotation.z = Math.PI / 2;
  }
  [-0.08, 0.06].forEach((z, i) => {
    stage.cylinder(0.03, 0.03, 0.016, 0.408, 1.55, z, i === 0 ? alertMat : steel, panel, 14).rotation.z = Math.PI / 2;
  });
  stage.box(0.42, 0.6, 0.34, 1.66, 0.98, 0.4, shellMat);
  stage.box(0.02, 0.5, 0.28, 1.88, 0.98, 0.4, dark);
  stage.box(0.03, 0.1, 0.06, 1.9, 1.14, 0.4, steel);
  stage.box(0.01, 0.05, 0.05, 1.905, 1.14, 0.4, okMat);
  stage.box(0.42, 0.3, 0.28, -1.0, 0.85, -0.44, dark);
  stage.box(0.44, 0.03, 0.3, -1.0, 1.01, -0.44, shellMat);
  [-0.12, 0.12].forEach((z, i) => stage.cylinder(0.026, 0.026, 0.04, -1.0 + z, 1.04, -0.44, i === 0 ? copper : steel, stage.group, 10));

  return {
    group: stage.group,
    parts: { engine, alternator, panel, radiator },
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
      /* Démarrage : préchauffage, lancement, montée en régime, prise de charge.
         Le ventilateur suit le régime, pas l'inverse. */
      const crank = clamp01(phase / 0.22);
      const speed = clamp01((phase - 0.16) / 0.5);
      const load = clamp01((phase - 0.55) / 0.45);

      fan.rotation.x = t / (600 - speed * 560) % (Math.PI * 2);
      belt.rotation.x = -(t / (700 - speed * 640)) % (Math.PI * 2);
      const shake = speed * 0.004;
      engine.position.y = Math.sin(t / 26) * shake;
      engine.position.z = Math.cos(t / 31) * shake * 0.6;

      puffs.forEach((puff, index) => {
        const travel = ((t / 2400 + puff.offset + index * 0.02) % 1 + 1) % 1;
        puff.mesh.position.y = 2.7 + travel * 1.05;
        puff.mesh.position.x = -0.24 + travel * 0.16;
        puff.mesh.scale.setScalar(0.5 + travel * 1.9);
      });
      smokeMat.opacity = speed * 0.16 * (1 - load * 0.4);

      const states = [crank > 0.2, crank > 0.6 && speed < 0.9, speed > 0.9, load > 0.5];
      const colors = [0xffa53d, 0xffa53d, 0x36d399, 0x4de0ff];
      lamps.forEach((lamp, index) => {
        const on = states[index];
        const hex = on ? colors[index] : 0x14304a;
        lamp.color.setHex(hex);
        lamp.emissive.setHex(hex);
        lamp.emissiveIntensity = on ? 1.9 + Math.sin(t / 400 + index) * 0.3 : 0.05;
      });
      displayMat.emissiveIntensity = 0.4 + phase * 1.8;
      okMat.emissiveIntensity = 0.2 + load * 2;
      amberMat.emissiveIntensity = 0.2 + crank * 2;
    },
    dispose: () => stage.dispose()
  };
}

export const GENERATOR_PRODUCT: ProductDefinition = {
  id: 'groupe-electrogene',
  name: 'Groupe électrogène',
  reference: 'GEN-250',
  entity: 'FRELAR ÉNERGIE',
  category: 'technique',
  glyph: 'generator',
  tagline:
  'Skid ouvert 250 kVA : réservoir intégré, moteur six cylindres, radiateur soufflant, alternateur et armoire de commande. La mise en service joue le démarrage complet.',
  target: [0, 1.2, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.68, phi: 0.22, radius: 6.6 },
  { id: 'moteur', label: 'Moteur', theta: 0.2, phi: 0.16, radius: 4.4 },
  { id: 'radiateur', label: 'Radiateur', theta: -1.45, phi: 0.18, radius: 4.8 },
  { id: 'alternateur', label: 'Alternateur', theta: 1.45, phi: 0.2, radius: 4.6 },
  { id: 'plongee', label: 'Plongée', theta: 0.5, phi: 0.85, radius: 6.4 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'moteur', label: 'Moteur six cylindres', value: '7,1 L · 1 500 tr/min · injection directe', position: [-0.08, 1.74, 0.2], normal: [-0.1, 0.7, 0.71], side: 'left' },
  { id: 'alternateur', label: 'Alternateur', value: '250 kVA · 400 V triphasé · cos φ 0,8', position: [1.15, 1.52, 0.3], normal: [0.4, 0.4, 0.82], side: 'right' },
  { id: 'radiateur', label: 'Radiateur soufflant', value: 'Fonctionnement jusqu’à 50 °C ambiants', position: [-1.42, 1.75, 0.3], normal: [-0.6, 0.5, 0.62], side: 'left' },
  { id: 'reservoir', label: 'Réservoir de châssis', value: '400 L · 8 h de pleine charge', position: [0.4, 0.44, 0.58], normal: [0, 0.2, 0.98], side: 'right' },
  { id: 'echappement', label: 'Échappement', value: 'Silencieux résidentiel · 25 dB(A) atténués', position: [0.28, 2.36, 0.62], normal: [0.2, 0.6, 0.77], side: 'right' },
  { id: 'armoire', label: 'Armoire de commande', value: 'Démarrage automatique · inversion de source', position: [1.74, 1.72, -0.6], normal: [0.9, 0.2, 0.39], side: 'right' },
  { id: 'plots', label: 'Plots antivibratoires', value: 'Isolation 92 % · pas de génie civil lourd', position: [-1.35, 0.08, 0.52], normal: [-0.5, 0.3, 0.81], side: 'left' },
  { id: 'batterie', label: 'Batterie et chargeur', value: 'Démarrage garanti · maintien de charge permanent', position: [-1.0, 1.02, -0.44], normal: [-0.4, 0.5, -0.77], side: 'left' }],

  dimensions: [
  { id: 'longueur', value: 'Skid 3 300 mm', from: [-1.65, 0.1, 0.6], to: [1.65, 0.1, 0.6], bias: [0, 1] },
  { id: 'hauteur', value: 'Hors tout 2 700 mm', from: [-1.9, 0, 0], to: [-1.9, 2.7, 0], bias: [-1, 0] },
  { id: 'largeur', value: 'Largeur 1 120 mm', from: [1.7, 0.44, -0.56], to: [1.7, 0.44, 0.56], bias: [1, 0] }],

  specs: [
  { label: 'Référence', value: 'GEN-250' },
  { label: 'Puissance', value: '250 kVA / 200 kW en secours' },
  { label: 'Tension', value: '400/230 V · 50 Hz · triphasé' },
  { label: 'Moteur', value: '6 cylindres 7,1 L · 1 500 tr/min' },
  { label: 'Autonomie', value: '8 h à pleine charge · 400 L' },
  { label: 'Démarrage', value: 'Automatique en 8 s sur perte réseau' },
  { label: 'Régulation', value: '± 0,5 % en tension · ± 0,25 Hz' },
  { label: 'Supervision', value: 'Report d’alarme · suivi de niveau à distance' }],

  demo: {
    idle: 'Démarrer le groupe',
    active: 'Arrêter le groupe',
    hint: 'Séquence réelle : préchauffage, lancement, montée en régime, prise de charge'
  },
  build
};
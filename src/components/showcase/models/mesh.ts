import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage } from './stage';

/**
 * Poste multi-appareils « MESH-4 » — FRELAR MOBILE LABS.
 *
 * La maquette met en scène ce qu'est réellement le cross-plateforme : un socle
 * métier unique, posé sous le plan de travail, relié par des conduits lumineux
 * aux quatre cibles — écran de bureau, portable, tablette et téléphone. Les
 * quatre terminaux sont allumés en permanence ; la démonstration propage une
 * mise en production depuis le socle vers chaque cible, l'une après l'autre,
 * en ouvrant l'écran du portable.
 */
const DESK_W = 2.5;
const DESK_D = 1.05;
const DESK_H = 0.74;

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}

/** Cible de déploiement : son écran s'allume quand la vague l'atteint. */
interface Target {
  material: THREE.MeshStandardMaterial;
  idle: number;
  live: number;
  at: number;
}

function build(): BuiltModel {
  const stage = new Stage();
  const deskMat = stage.standard(0x1a2b40, 0.7, 0.44);
  const legMat = stage.standard(0x18293e, 0.92, 0.34);
  const steel = stage.standard(0x93a7b8, 1, 0.26);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const shell = stage.standard(0x232f3d, 0.72, 0.42);
  const rubber = stage.standard(0x0c1118, 0.1, 0.95);
  const red = stage.standard(0xe30613, 0.5, 0.36);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const CYAN = 0x5cb3f0;
  const coreMat = led(CYAN, 2.2, 0.5, 1800);
  const conduitMat = led(CYAN, 1.6, 0.6, 1200, 200);
  const accentMat = led(0xe30613, 2.0, 0.8, 950, 120);
  const keyMat = led(CYAN, 1.1, 0.15, 4200);

  const targets: Target[] = [];
  const screen = (color: number, idle: number, live: number, at: number) => {
    const material = stage.emissive(color, idle);
    targets.push({ material, idle, live, at });
    return material;
  };
  const monitorScreen = screen(CYAN, 1.5, 2.9, 0.18);
  const laptopScreen = screen(CYAN, 1.4, 2.8, 0.42);
  const tabletScreen = screen(CYAN, 1.35, 2.7, 0.64);
  const phoneScreen = screen(CYAN, 1.3, 2.6, 0.84);

  /* ═══ Plan de travail : plateau, chants, piètement en T ═══ */
  stage.box(DESK_W, 0.035, DESK_D, 0, DESK_H, 0, deskMat);
  stage.box(DESK_W + 0.01, 0.012, DESK_D + 0.01, 0, DESK_H - 0.024, 0, dark);
  [-DESK_W / 2 + 0.18, DESK_W / 2 - 0.18].forEach((x) => {
    stage.box(0.06, DESK_H - 0.05, 0.06, x, (DESK_H - 0.05) / 2, 0, legMat);
    stage.box(0.1, 0.03, DESK_D - 0.16, x, 0.02, 0, dark);
    stage.box(0.14, 0.02, DESK_D - 0.3, x, DESK_H - 0.06, 0, legMat);
    // Patins réglables.
    [-0.36, 0.36].forEach((z) => stage.cylinder(0.026, 0.03, 0.014, x, 0.008, z, rubber, stage.group, 14));
  });
  // Passe-câbles et chemin de câbles sous le plateau.
  stage.cylinder(0.035, 0.035, 0.04, 0.62, DESK_H, -0.32, dark, stage.group, 18);
  stage.box(DESK_W - 0.6, 0.02, 0.1, 0, DESK_H - 0.14, 0.24, steel);
  for (let c = 0; c < 5; c += 1) {
    const cable = stage.cylinder(0.008, 0.008, 0.2, -0.4 + c * 0.2, DESK_H - 0.22, 0.24, c % 2 === 0 ? dark : red, stage.group, 8);
    cable.rotation.x = 0.3;
  }

  /* ═══ Socle métier partagé : la pièce centrale du dispositif ═══ */
  const core = stage.group3(stage.group, 0, DESK_H - 0.34, 0.02);
  stage.cylinder(0.15, 0.17, 0.022, 0, -0.09, 0, dark, core, 32);
  for (let i = 0; i < 6; i += 1) {
    const a = i / 6 * Math.PI * 2;
    stage.box(0.02, 0.012, 0.02, Math.cos(a) * 0.13, -0.078, Math.sin(a) * 0.13, steel, core);
  }
  // Noyau : octaèdre lumineux en cage.
  const coreGeo = new THREE.OctahedronGeometry(0.085, 0);
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, 0, 0);
  core.add(coreMesh);
  const cage = stage.group3(core, 0, 0, 0);
  [0, 1, 2].forEach((axis) => {
    const ring = stage.torus(0.115, 0.0035, 0, 0, 0, steel, cage);
    if (axis === 0) ring.rotation.x = Math.PI / 2;
    if (axis === 1) ring.rotation.y = Math.PI / 2;
  });
  // Colonne de liaison vers le plateau.
  stage.cylinder(0.012, 0.012, 0.22, 0, 0.2, 0, steel, core, 12);
  stage.box(0.09, 0.014, 0.09, 0, 0.31, 0, dark, core);

  /* ═══ Conduits lumineux : socle → chaque cible ═══ */
  const conduitTo = (x: number, z: number) => {
    const length = Math.hypot(x, z - 0.02);
    const conduit = stage.cylinder(0.006, 0.006, length, x / 2, DESK_H + 0.012, (z + 0.02) / 2, conduitMat, stage.group, 8);
    conduit.rotation.z = Math.PI / 2;
    conduit.rotation.y = -Math.atan2(z - 0.02, x);
    // Trois nœuds de repère le long du conduit.
    for (let k = 1; k <= 3; k += 1) {
      const t = k / 4;
      stage.box(0.016, 0.008, 0.016, x * t, DESK_H + 0.014, 0.02 + (z - 0.02) * t, accentMat);
    }
  };

  /* ═══ Cible 1 — Écran de bureau sur bras articulé ═══ */
  const monitorX = -0.62;
  const monitorZ = -0.3;
  conduitTo(monitorX, monitorZ);
  stage.cylinder(0.05, 0.06, 0.02, monitorX, DESK_H + 0.028, monitorZ, dark, stage.group, 20);
  stage.cylinder(0.018, 0.018, 0.3, monitorX, DESK_H + 0.19, monitorZ, steel, stage.group, 14);
  const arm = stage.group3(stage.group, monitorX, DESK_H + 0.34, monitorZ);
  stage.box(0.22, 0.022, 0.03, 0.11, 0, 0.02, steel, arm);
  const monitorHead = stage.group3(arm, 0.24, 0.16, 0.06);
  stage.box(0.7, 0.42, 0.022, 0, 0, 0, shell, monitorHead);
  /* La dalle regarde l'opérateur : elle est posée sur la face +Z, celle qui
     fait face au poste, et la fixation part vers l'arrière. */
  stage.box(0.66, 0.38, 0.006, 0, 0.008, 0.014, monitorScreen, monitorHead);
  stage.box(0.7, 0.03, 0.024, 0, -0.225, 0, dark, monitorHead);
  stage.box(0.05, 0.05, 0.03, 0, 0, -0.026, dark, monitorHead);
  monitorHead.rotation.y = 0.34;
  // Fenêtres de code : quatre colonnes de barres, non lisibles.
  for (let col = 0; col < 2; col += 1) {
    for (let row = 0; row < 9; row += 1) {
      stage.box(0.13 - row * 0.008, 0.008, 0.002, -0.15 + col * 0.32, 0.15 - row * 0.037, 0.019, row % 4 === 0 ? accentMat : keyMat, monitorHead);
    }
  }

  /* ═══ Cible 2 — Portable, écran relevable ═══ */
  const laptopX = 0.02;
  const laptopZ = 0.16;
  conduitTo(laptopX, laptopZ - 0.12);
  const laptop = stage.group3(stage.group, laptopX, DESK_H + 0.02, laptopZ);
  stage.box(0.42, 0.014, 0.3, 0, 0, 0, shell, laptop);
  stage.box(0.3, 0.004, 0.14, 0, 0.009, 0.05, dark, laptop);
  // Clavier : rangées de touches.
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 13; c += 1) {
      stage.box(0.019, 0.004, 0.019, -0.14 + c * 0.0235, 0.011, -0.09 + r * 0.026, dark, laptop);
    }
  }
  stage.box(0.11, 0.003, 0.07, 0, 0.011, 0.09, steel, laptop);
  const lid = stage.group3(laptop, 0, 0.005, -0.15);
  stage.box(0.42, 0.28, 0.012, 0, 0.14, 0, shell, lid);
  // Dalle côté clavier : le capot bascule en arrière, l'écran reste face au poste.
  stage.box(0.39, 0.25, 0.004, 0, 0.145, 0.008, laptopScreen, lid);
  for (let row = 0; row < 8; row += 1) {
    stage.box(0.2 - row * 0.012, 0.007, 0.002, -0.07, 0.235 - row * 0.026, 0.011, row % 3 === 0 ? accentMat : keyMat, lid);
  }
  lid.rotation.x = -0.28;

  /* ═══ Cible 3 — Tablette sur support incliné ═══ */
  const tabletX = 0.78;
  const tabletZ = -0.16;
  conduitTo(tabletX, tabletZ);
  stage.box(0.2, 0.014, 0.14, tabletX, DESK_H + 0.026, tabletZ, dark);
  const standLeg = stage.box(0.02, 0.16, 0.03, tabletX, DESK_H + 0.1, tabletZ + 0.05, steel);
  standLeg.rotation.x = 0.4;
  const tablet = stage.group3(stage.group, tabletX, DESK_H + 0.14, tabletZ);
  stage.box(0.26, 0.36, 0.012, 0, 0, 0, shell, tablet);
  stage.box(0.235, 0.335, 0.004, 0, 0, 0.008, tabletScreen, tablet);
  for (let row = 0; row < 7; row += 1) {
    stage.box(0.14 - row * 0.01, 0.008, 0.002, -0.03, 0.12 - row * 0.032, 0.011, row === 1 ? accentMat : keyMat, tablet);
  }
  tablet.rotation.x = -0.38;
  tablet.rotation.y = -0.3;

  /* ═══ Cible 4 — Téléphone sur socle de charge ═══ */
  const phoneX = 1.02;
  const phoneZ = 0.2;
  conduitTo(phoneX, phoneZ);
  stage.box(0.11, 0.016, 0.09, phoneX, DESK_H + 0.026, phoneZ, dark);
  const dock = stage.box(0.012, 0.1, 0.02, phoneX, DESK_H + 0.08, phoneZ + 0.03, steel);
  dock.rotation.x = 0.3;
  const phone = stage.group3(stage.group, phoneX, DESK_H + 0.12, phoneZ);
  stage.box(0.095, 0.19, 0.01, 0, 0, 0, shell, phone);
  stage.box(0.085, 0.175, 0.004, 0, 0, 0.007, phoneScreen, phone);
  stage.box(0.03, 0.006, 0.003, 0, 0.078, 0.01, dark, phone);
  for (let row = 0; row < 5; row += 1) {
    stage.box(0.055 - row * 0.006, 0.006, 0.002, -0.008, 0.05 - row * 0.026, 0.01, row === 0 ? accentMat : keyMat, phone);
  }
  phone.rotation.x = -0.3;
  phone.rotation.y = -0.42;

  /* ═══ Accessoires : clavier, souris, lampe, tasse, carnet ═══ */
  const kbd = stage.group3(stage.group, -0.55, DESK_H + 0.028, 0.24);
  stage.box(0.44, 0.022, 0.15, 0, 0, 0, dark, kbd);
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 14; c += 1) {
      stage.box(0.021, 0.008, 0.021, -0.15 + c * 0.0235, 0.014, -0.05 + r * 0.026, r === 0 && c % 5 === 0 ? accentMat : shell, kbd);
    }
  }
  kbd.rotation.y = 0.12;
  const mouse = stage.sphere(0.045, -0.2, DESK_H + 0.034, 0.26, shell);
  mouse.scale.set(1, 0.5, 1.4);
  // Lampe d'architecte.
  stage.cylinder(0.055, 0.065, 0.016, -1.02, DESK_H + 0.026, -0.3, dark, stage.group, 20);
  stage.cylinder(0.012, 0.012, 0.38, -1.02, DESK_H + 0.22, -0.3, steel, stage.group, 12);
  const lampArm = stage.box(0.28, 0.016, 0.02, -0.9, DESK_H + 0.4, -0.3, steel);
  lampArm.rotation.z = -0.16;
  const shade = stage.cylinder(0.045, 0.06, 0.07, -0.78, DESK_H + 0.35, -0.3, dark, stage.group, 18);
  shade.rotation.x = 0.4;
  stage.cylinder(0.05, 0.05, 0.005, -0.78, DESK_H + 0.315, -0.3, keyMat, stage.group, 18);
  // Tasse et carnet : ce qui rend un poste habité.
  stage.cylinder(0.042, 0.038, 0.095, 0.5, DESK_H + 0.065, 0.3, shell, stage.group, 20);
  const handle = stage.torus(0.028, 0.006, 0.545, DESK_H + 0.07, 0.3, shell);
  handle.rotation.y = Math.PI / 2;
  stage.box(0.2, 0.014, 0.28, -0.94, DESK_H + 0.026, 0.22, red);
  stage.box(0.185, 0.006, 0.265, -0.94, DESK_H + 0.036, 0.22, shell);

  stage.contactShadow(3.9, 2.4, 0, 0.05);
  stage.rings(1.62, 0, 0.05);

  return {
    group: stage.group,
    parts: { lid, core, monitor: monitorHead },
    setFinish: (hex) => {
      deskMat.color.setHex(hex);
      legMat.color.setHex(hex);
    },
    setPhase: (phase) => {
      const t = performance.now();
      pulses.forEach((pulse) => {
        pulse.material.emissiveIntensity =
        pulse.base + Math.sin((t + pulse.offset) / pulse.period * Math.PI * 2) * pulse.swing;
      });
      // Le noyau tourne en permanence : le socle partagé est toujours actif.
      cage.rotation.y = t / 2600;
      coreMesh.rotation.y = -t / 1700;
      coreMesh.rotation.x = Math.sin(t / 3100) * 0.25;

      /* La vague de déploiement part du socle et atteint chaque cible à son
         tour : c'est la démonstration du « écrit une fois, déployé partout ». */
      targets.forEach((target) => {
        const reached = Math.max(0, Math.min(1, (phase - target.at) * 6));
        target.material.emissiveIntensity =
        target.idle + (target.live - target.idle) * reached + (reached > 0.5 ? Math.sin(t / 220) * 0.25 : 0);
      });
      coreMat.emissiveIntensity = 2.2 + phase * 1.6 + Math.sin(t / 400) * (0.3 + phase * 0.6);
      conduitMat.emissiveIntensity = 1.6 + phase * 1.4 + Math.sin(t / 260) * 0.5;
      // L'écran du portable s'ouvre pendant la propagation.
      lid.rotation.x = -0.28 - phase * 0.5;
    },
    dispose: () => stage.dispose()
  };
}

export const MESH_PRODUCT: ProductDefinition = {
  id: 'multi-appareils',
  name: 'Poste multi-appareils',
  reference: 'MESH-4',
  entity: 'FRELAR MOBILE LABS',
  category: 'it',
  glyph: 'mesh',
  tagline: 'Un socle métier unique relié à quatre cibles : écran de bureau, portable, tablette et téléphone — une seule mise en production.',
  target: [0, 0.92, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.66, phi: 0.3, radius: 4.2 },
  { id: 'face', label: 'Face', theta: 0, phi: 0.2, radius: 3.6 },
  { id: 'socle', label: 'Socle partagé', theta: 0.35, phi: 0.06, radius: 2.1 },
  { id: 'mobile', label: 'Cibles mobiles', theta: -0.72, phi: 0.32, radius: 2.4 },
  { id: 'plongee', label: 'Plongée', theta: 0.5, phi: 0.82, radius: 3.4 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1a2b40, swatch: '#1a2b40' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  {
    id: 'socle',
    label: 'Socle métier partagé',
    value: 'Règles écrites une fois · 70 à 85 % du code',
    position: [0, 0.44, 0.14],
    normal: [0, 0.2, 0.98],
    side: 'left'
  },
  {
    id: 'bureau',
    label: 'Cible bureau',
    value: 'Windows · macOS · Linux',
    position: [-0.4, 1.24, -0.24],
    normal: [-0.3, 0.2, 0.93],
    side: 'left'
  },
  {
    id: 'web',
    label: 'Cible web',
    value: 'Navigateur · rendu serveur',
    position: [0.02, 1.02, 0.02],
    normal: [0, 0.5, 0.87],
    side: 'left',
    part: 'lid'
  },
  {
    id: 'tablette',
    label: 'Cible tablette',
    value: 'iPad OS · Android tablette',
    position: [0.78, 1.02, -0.2],
    normal: [0.3, 0.4, 0.87],
    side: 'right'
  },
  {
    id: 'telephone',
    label: 'Cible téléphone',
    value: 'iOS 15+ · Android 8+',
    position: [1.02, 0.94, 0.16],
    normal: [0.4, 0.35, 0.85],
    side: 'right'
  },
  {
    id: 'conduits',
    label: 'Conduits de diffusion',
    value: 'Socle versionné en dépendance interne',
    position: [0.4, 0.77, -0.1],
    normal: [0.1, 0.95, 0.3],
    side: 'right'
  },
  {
    id: 'design-system',
    label: 'Design system décliné',
    value: 'Un référentiel · conventions natives',
    position: [-0.4, 1.05, -0.22],
    normal: [-0.4, -0.2, 0.89],
    side: 'left'
  },
  {
    id: 'pipeline',
    label: 'Pipeline unique',
    value: 'Six cibles compilées à chaque fusion',
    position: [-0.94, 0.79, 0.22],
    normal: [-0.5, 0.75, 0.43],
    side: 'left'
  }],

  dimensions: [
  { id: 'plan', value: '2 500 mm de plan', from: [-1.25, 0.74, -0.5], to: [1.25, 0.74, -0.5], bias: [0, 1] },
  { id: 'cibles', value: '4 cibles simultanées', from: [-0.62, 1.08, -0.3], to: [1.02, 1.08, 0.2], bias: [0, -1] },
  { id: 'socle', value: 'Socle Ø 340 mm', from: [-0.17, 0.4, 0.02], to: [0.17, 0.4, 0.02], bias: [0, 1] }],

  specs: [
  { label: 'Référence', value: 'MESH-4' },
  { label: 'Cibles couvertes', value: 'Web, iOS, Android, bureau' },
  { label: 'Code partagé', value: '70 à 85 %' },
  { label: 'Socle', value: 'Flutter · React Native · .NET MAUI' },
  { label: 'Hors-ligne', value: 'Base locale chiffrée' },
  { label: 'Publication', value: 'Synchronisée sur toutes les cibles' },
  { label: 'Versionnage', value: 'Sémantique, journal des changements' },
  { label: 'Délai type', value: '10 à 24 semaines' }],

  demo: {
    idle: 'Déployer sur les 4 cibles',
    active: 'Revenir au repos',
    hint: 'La vague part du socle et atteint chaque cible à son tour'
  },
  build
};
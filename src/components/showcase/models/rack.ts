import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage } from './stage';

/**
 * Baie serveur 42U « EDGE-42 » — FRELAR CLOUD & OPS.
 *
 * Ce qui rend une baie crédible, ce n'est pas le volume : c'est la mécanique et
 * la vie électrique. Montants percés au pas U, serveurs sur glissières
 * télescopiques, bandeau de LED d'activité, commutateur 24 ports brassé, tiroir
 * console KVM, panneau de brassage, onduleur en pied de baie, obturateurs
 * d'airflow, tresse de masse et sonde de température.
 *
 * La baie est SOUS TENSION en permanence : les LED d'activité, l'afficheur de
 * l'onduleur et les ports du commutateur vivent en continu, chacun sur sa
 * propre cadence. La démonstration n'allume rien — elle ouvre la porte et
 * extrait un serveur sur ses rails, le geste exact d'une intervention.
 */
const W = 0.62;
const H = 2.02;
const D = 1.02;
const SLED_TRAVEL = 0.72;

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}

function build(): BuiltModel {
  const stage = new Stage();
  const frameMat = stage.standard(0x18293e, 0.92, 0.34);
  const panelMat = stage.standard(0x18293e, 0.86, 0.42);
  const steel = stage.standard(0x93a7b8, 1, 0.26);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const rubber = stage.standard(0x0c1118, 0.1, 0.95);
  const red = stage.standard(0xe30613, 0.5, 0.36);
  const copper = stage.standard(0xb87333, 0.9, 0.34);
  const bezel = stage.standard(0x1b2635, 0.62, 0.55);
  const blank = stage.standard(0x131e2c, 0.55, 0.62);

  /* — Vie électrique : chaque famille de LED a sa cadence propre. Une baie
     dont tous les voyants clignotent à l'unisson sonne faux. — */
  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset: number) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const CYAN = 0x5cb3f0;
  const ledBusA = led(CYAN, 2.6, 0.7, 1400, 0);
  const ledBusB = led(CYAN, 2.4, 0.9, 900, 320);
  const ledBusC = led(CYAN, 2.2, 1.1, 620, 140);
  const ledLink = led(0x36d399, 2.4, 0.5, 2100, 60);
  const ledAlert = led(0xe30613, 2.2, 1.0, 1100, 210);
  const ledAmber = led(0xf59e0b, 2.0, 0.6, 1700, 480);
  const ledScreen = led(CYAN, 1.7, 0.25, 3200, 0);
  const ledSled = led(0xe30613, 2.3, 1.2, 780, 0);

  const halfW = W / 2;
  const halfD = D / 2;
  const front = -halfD + 0.185;

  /* ═══ Socle : plinthe, roulettes pivotantes et pieds réglables ═══ */
  stage.box(W + 0.06, 0.07, D + 0.06, 0, 0.035, 0, dark);
  [
  [-halfW + 0.07, -halfD + 0.09],
  [halfW - 0.07, -halfD + 0.09],
  [-halfW + 0.07, halfD - 0.09],
  [halfW - 0.07, halfD - 0.09]].
  forEach(([x, z]) => {
    const caster = stage.cylinder(0.035, 0.035, 0.03, x, 0.03, z, rubber, stage.group, 16);
    caster.rotation.z = Math.PI / 2;
    stage.cylinder(0.016, 0.016, 0.05, x, 0.062, z, steel, stage.group, 10);
    stage.box(0.05, 0.012, 0.05, x, 0.086, z, dark);
  });

  /* ═══ Ossature : quatre montants et huit traverses ═══ */
  const baseY = 0.075;
  const posts: [number, number][] = [
  [-halfW + 0.03, -halfD + 0.05],
  [halfW - 0.03, -halfD + 0.05],
  [-halfW + 0.03, halfD - 0.05],
  [halfW - 0.03, halfD - 0.05]];

  posts.forEach(([x, z]) => stage.box(0.05, H, 0.05, x, baseY + H / 2, z, frameMat));
  [baseY, baseY + H].forEach((y) => {
    stage.box(W - 0.02, 0.04, 0.04, 0, y, -halfD + 0.05, frameMat);
    stage.box(W - 0.02, 0.04, 0.04, 0, y, halfD - 0.05, frameMat);
    stage.box(0.04, 0.04, D - 0.06, -halfW + 0.03, y, 0, frameMat);
    stage.box(0.04, 0.04, D - 0.06, halfW - 0.03, y, 0, frameMat);
  });

  /* ═══ Rails 19″ percés au pas U ═══ */
  const U = (H - 0.14) / 42;
  const slotY = (slot: number, heightU = 0) => baseY + 0.07 + (slot + heightU / 2) * U;
  [-halfD + 0.12, halfD - 0.16].forEach((z) => {
    [-halfW + 0.075, halfW - 0.075].forEach((x) => {
      stage.box(0.022, H - 0.1, 0.05, x, baseY + H / 2, z, steel);
    });
  });
  for (let i = 0; i < 42; i += 1) {
    const y = slotY(i, 1);
    for (let k = 0; k < 3; k += 1) {
      stage.box(0.008, 0.008, 0.012, -halfW + 0.075, y + (k - 1) * U * 0.3, -halfD + 0.148, dark);
    }
    // Repère de U tous les cinq niveaux : la sérigraphie d'un vrai montant.
    if (i % 5 === 0) stage.box(0.014, 0.004, 0.012, halfW - 0.075, y, -halfD + 0.148, steel);
  }

  /* ═══ Flancs perforés nervurés et fond ═══ */
  [-halfW + 0.008, halfW - 0.008].forEach((x) => {
    stage.box(0.012, H - 0.06, D - 0.14, x, baseY + H / 2, 0, panelMat);
    for (let i = 0; i < 16; i += 1) {
      stage.box(0.016, 0.055, D - 0.24, x, baseY + 0.14 + i * 0.115, 0, dark);
    }
  });
  stage.box(W - 0.05, H - 0.06, 0.012, 0, baseY + H / 2, halfD - 0.012, panelMat);

  /* ═══ Toit : quatre extracteurs à pales et grille ═══ */
  stage.box(W + 0.04, 0.05, D + 0.04, 0, baseY + H + 0.045, 0, dark);
  const fans: THREE.Mesh[] = [];
  [[-0.14, -0.22], [0.14, -0.22], [-0.14, 0.22], [0.14, 0.22]].forEach(([x, z]) => {
    const fan = stage.cylinder(0.085, 0.085, 0.018, x, baseY + H + 0.08, z, dark, stage.group, 22);
    fans.push(fan);
    stage.cylinder(0.03, 0.03, 0.026, x, baseY + H + 0.088, z, steel, stage.group, 14);
    for (let b = 0; b < 7; b += 1) {
      const a = b / 7 * Math.PI * 2;
      const blade = stage.box(0.058, 0.006, 0.026, x + Math.cos(a) * 0.05, baseY + H + 0.086, z + Math.sin(a) * 0.05, steel, stage.group);
      blade.rotation.y = -a;
      blade.rotation.z = 0.35;
      fan.attach(blade);
    }
    // Grille de protection : quatre arceaux concentriques.
    for (let r = 1; r <= 3; r += 1) {
      const ring = stage.torus(0.024 * r, 0.0022, x, baseY + H + 0.098, z, steel, stage.group);
      ring.rotation.x = Math.PI / 2;
    }
  });

  /* ═══ Équipements ═══ */
  const makeServer = (
  slot: number,
  heightU: number,
  parent: THREE.Object3D,
  activity: THREE.Material,
  status: THREE.Material) =>
  {
    const y = slotY(slot, heightU);
    const h = heightU * U - 0.006;
    // Châssis + façade.
    stage.box(W - 0.19, h, D - 0.34, 0, y, -halfD + 0.2 + (D - 0.34) / 2 - 0.015, dark, parent);
    stage.box(W - 0.17, h, 0.014, 0, y, front, bezel, parent);
    // Ouïes d'aspiration en nid d'abeille (deux rangées).
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        stage.box(0.012, 0.008, 0.006, -0.09 + c * 0.023, y + (r === 0 ? h * 0.34 : -h * 0.34), front - 0.008, dark, parent);
      }
    }
    // Quatre baies de disques à poignée et voyant.
    for (let b = 0; b < 4; b += 1) {
      const bx = -0.19 + b * 0.062;
      stage.box(0.052, h * 0.66, 0.01, bx, y, front - 0.009, dark, parent);
      stage.box(0.01, h * 0.42, 0.008, bx + 0.016, y, front - 0.015, steel, parent);
      stage.box(0.006, 0.006, 0.005, bx - 0.014, y + h * 0.22, front - 0.015, b % 2 === 0 ? activity : status, parent);
    }
    // Bandeau d'activité, voyant d'état et bouton d'alimentation.
    stage.box(0.075, 0.006, 0.007, 0.19, y + h * 0.26, front - 0.012, activity, parent);
    stage.box(0.008, 0.008, 0.006, 0.235, y + h * 0.26, front - 0.013, status, parent);
    const power = stage.cylinder(0.009, 0.009, 0.008, 0.235, y - h * 0.24, front - 0.012, steel, parent, 12);
    power.rotation.x = Math.PI / 2;
    stage.cylinder(0.005, 0.005, 0.005, 0.235, y - h * 0.24, front - 0.017, ledLink, parent, 10).rotation.x = Math.PI / 2;
    // Poignées de manutention.
    [-0.245, 0.265].forEach((hx) => stage.box(0.013, h * 0.72, 0.024, hx, y, front - 0.018, steel, parent));
    return y;
  };

  /* Le serveur extractible est un sous-ensemble : ses repères le suivent. */
  const sled = stage.group3(stage.group);
  const sledY = makeServer(26, 2, sled, ledSled, ledAmber);
  // Glissières télescopiques : la partie fixe reste visible sous le serveur.
  [-halfW + 0.1, halfW - 0.1].forEach((x) => {
    stage.box(0.016, 0.014, D - 0.3, x, sledY - U, 0, steel);
    stage.box(0.02, 0.008, 0.05, x, sledY - U + 0.012, -halfD + 0.22, dark);
  });

  makeServer(38, 2, stage.group, ledBusA, ledLink);
  makeServer(35, 2, stage.group, ledBusB, ledLink);
  makeServer(32, 2, stage.group, ledBusC, ledAmber);
  makeServer(22, 2, stage.group, ledBusB, ledLink);
  makeServer(19, 2, stage.group, ledBusA, ledLink);
  makeServer(14, 2, stage.group, ledBusC, ledLink);

  /* ═══ Commutateur 24 ports : les ports vivent, le brassage se voit ═══ */
  const switchY = slotY(30, 1);
  stage.box(W - 0.17, U * 0.9, D - 0.4, 0, switchY, -halfD + 0.48, dark);
  stage.box(W - 0.15, U * 0.9, 0.012, 0, switchY, front, bezel);
  for (let p = 0; p < 24; p += 1) {
    const row = p < 12 ? 1 : -1;
    const col = p % 12;
    const px = -0.2 + col * 0.036;
    stage.box(0.026, 0.013, 0.01, px, switchY + row * 0.011, front - 0.009, dark);
    const lamp = p % 7 === 0 ? ledAlert : p % 3 === 0 ? ledLink : ledBusC;
    stage.box(0.005, 0.004, 0.005, px, switchY + row * 0.011, front - 0.015, lamp);
    // Cordon de brassage sur un port sur trois : la baie est réellement câblée.
    if (p % 3 === 1) {
      const cord = stage.cylinder(0.0055, 0.0055, 0.11, px, switchY + row * 0.011 - 0.05, front - 0.026, p % 2 === 0 ? red : steel, stage.group, 8);
      cord.rotation.x = 0.42;
      cord.rotation.z = (col - 5.5) * 0.045;
    }
  }
  stage.box(0.05, 0.012, 0.008, 0.22, switchY, front - 0.014, ledScreen);

  /* ═══ Panneau de brassage 24 keystone ═══ */
  const patchY = slotY(28, 1);
  stage.box(W - 0.15, U * 0.9, 0.014, 0, patchY, front, bezel);
  for (let p = 0; p < 24; p += 1) {
    const row = p < 12 ? 1 : -1;
    const px = -0.2 + p % 12 * 0.036;
    stage.box(0.028, 0.016, 0.012, px, patchY + row * 0.012, front - 0.008, dark);
    stage.box(0.03, 0.004, 0.004, px, patchY + row * 0.012 - 0.012, front - 0.012, row > 0 ? steel : red);
  }

  /* ═══ Tiroir console KVM : clavier escamotable + écran relevé ═══ */
  const kvmY = slotY(24, 1);
  stage.box(W - 0.17, U * 0.85, D - 0.44, 0, kvmY, -halfD + 0.5, dark);
  stage.box(W - 0.15, U * 0.85, 0.014, 0, kvmY, front, bezel);
  const kvmScreen = stage.group3(stage.group, 0, kvmY + U * 0.42, front - 0.02);
  stage.box(0.3, 0.19, 0.012, 0, 0.095, 0, dark, kvmScreen);
  stage.box(0.275, 0.165, 0.004, 0, 0.095, -0.008, ledScreen, kvmScreen);
  kvmScreen.rotation.x = -0.34;
  // Lignes de texte de la console : trois barres courtes, non lisibles.
  [0.05, 0.02, -0.01].forEach((dy, i) => {
    stage.box(0.16 - i * 0.04, 0.006, 0.002, -0.04 - i * 0.02, 0.095 + dy, -0.012, ledLink, kvmScreen);
  });

  /* ═══ Onduleur en pied de baie : afficheur et jauge de batterie ═══ */
  const upsY = slotY(4, 4);
  const upsH = 4 * U - 0.008;
  stage.box(W - 0.17, upsH, D - 0.36, 0, upsY, -halfD + 0.42, dark);
  stage.box(W - 0.15, upsH, 0.016, 0, upsY, front, bezel);
  stage.box(0.14, 0.05, 0.006, -0.12, upsY + 0.012, front - 0.011, ledScreen);
  for (let b = 0; b < 5; b += 1) {
    stage.box(0.02, 0.028, 0.006, 0.06 + b * 0.028, upsY + 0.012, front - 0.011, b < 4 ? ledLink : dark);
  }
  stage.box(0.1, 0.008, 0.006, -0.12, upsY - 0.038, front - 0.011, ledAlert);
  [-0.2, 0.22].forEach((hx) => stage.box(0.014, upsH * 0.6, 0.026, hx, upsY, front - 0.02, steel));

  /* ═══ Obturateurs d'airflow dans les U libres : détail d'exploitation ═══ */
  [9, 10, 11, 12, 16, 17, 36, 37, 40, 41].forEach((slot) => {
    stage.box(W - 0.16, U * 0.88, 0.01, 0, slotY(slot, 1), front + 0.002, blank);
    [-0.2, 0.2].forEach((x) => stage.box(0.012, 0.012, 0.008, x, slotY(slot, 1), front - 0.004, steel));
  });

  /* ═══ Bandeau d'alimentation redondé, sur le montant arrière ═══ */
  const pdu = stage.group3(stage.group, halfW - 0.055, baseY + H / 2, halfD - 0.09);
  stage.box(0.05, H * 0.82, 0.05, 0, 0, 0, dark, pdu);
  for (let i = 0; i < 14; i += 1) {
    stage.box(0.03, 0.032, 0.03, -0.006, -H * 0.36 + i * (H * 0.72 / 13), 0.026, steel, pdu);
    stage.box(0.006, 0.006, 0.005, 0.014, -H * 0.36 + i * (H * 0.72 / 13), 0.03, ledLink, pdu);
  }
  stage.box(0.028, 0.05, 0.014, -0.006, H * 0.39, 0.03, ledScreen, pdu);

  /* ═══ Guidage des câbles et faisceaux ═══ */
  for (let i = 0; i < 5; i += 1) {
    const y = baseY + 0.28 + i * 0.36;
    stage.box(W - 0.2, 0.018, 0.05, 0, y, halfD - 0.14, steel);
    for (let c = 0; c < 6; c += 1) {
      const cable = stage.cylinder(0.008, 0.008, 0.17, -0.18 + c * 0.072, y - 0.075, halfD - 0.13, c % 3 === 0 ? red : dark, stage.group, 8);
      cable.rotation.x = 0.22;
    }
  }

  /* ═══ Tresse de masse et sonde de température : la baie est raccordée ═══ */
  const braid = stage.cylinder(0.007, 0.007, 0.3, -halfW + 0.05, 0.2, halfD - 0.11, copper, stage.group, 8);
  braid.rotation.z = 0.5;
  stage.box(0.03, 0.02, 0.012, -halfW + 0.05, 0.36, halfD - 0.11, copper);
  const probe = stage.cylinder(0.005, 0.005, 0.05, -halfW + 0.09, baseY + H - 0.12, -halfD + 0.24, steel, stage.group, 8);
  probe.rotation.x = 0.4;
  stage.box(0.026, 0.018, 0.01, -halfW + 0.09, baseY + H - 0.09, -halfD + 0.23, ledAmber);

  /* ═══ Plaque d'inventaire ═══ */
  stage.box(0.11, 0.03, 0.006, -0.16, baseY + H - 0.02, front - 0.004, steel);
  stage.box(0.08, 0.006, 0.004, -0.16, baseY + H - 0.02, front - 0.008, dark);

  /* ═══ Porte vitrée avant : cadre, verre teinté, poignée, charnières ═══ */
  const door = stage.group3(stage.group, -halfW + 0.02, 0, -halfD + 0.03);
  const doorMid = stage.group3(door, halfW - 0.02, baseY + H / 2, 0);
  stage.box(W - 0.02, H - 0.04, 0.022, 0, 0, 0, frameMat, doorMid);
  const glassGeo = new THREE.BoxGeometry(W - 0.11, H - 0.14, 0.008);
  const glassMat = stage.mat(new THREE.MeshPhysicalMaterial({
    color: 0x0e1a2b,
    metalness: 0.1,
    roughness: 0.06,
    transparent: true,
    opacity: 0.28,
    transmission: 0.62
  }));
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 0, -0.004);
  doorMid.add(glass);
  stage.box(0.016, 0.13, 0.05, halfW - 0.06, 0, -0.03, steel, doorMid);
  stage.box(0.026, 0.026, 0.014, halfW - 0.06, -0.12, -0.02, dark, doorMid);
  [-1, 1].forEach((s) => stage.cylinder(0.014, 0.014, 0.06, -halfW + 0.03, s * (H / 2 - 0.2), 0, steel, doorMid, 12));

  stage.contactShadow(2.9, 2.9, 0, 0);
  stage.rings(1.22, 0, 0);

  return {
    group: stage.group,
    parts: { sled, door },
    setFinish: (hex) => {
      frameMat.color.setHex(hex);
      panelMat.color.setHex(hex);
    },
    setPhase: (phase) => {
      /* La baie est sous tension quelle que soit la phase : la démonstration
         n'allume rien, elle ouvre et extrait. Chaque famille de voyants suit sa
         propre cadence pour que rien ne clignote à l'unisson. */
      const t = performance.now();
      pulses.forEach((pulse) => {
        pulse.material.emissiveIntensity =
        pulse.base + Math.sin((t + pulse.offset) / pulse.period * Math.PI * 2) * pulse.swing;
      });
      // Les extracteurs tournent en continu : une baie éteinte ne respire pas.
      fans.forEach((fan, i) => {
        fan.rotation.y = t / 1000 * (5.4 + i * 0.4);
      });

      // Porte d'abord, puis glissières : deux temps, jamais simultanés.
      const doorPhase = Math.min(1, phase / 0.4);
      const sledPhase = Math.max(0, (phase - 0.35) / 0.65);
      door.rotation.y = -doorPhase * 1.62;
      sled.position.z = -SLED_TRAVEL * sledPhase;
      // Le serveur extrait passe en alerte : il est hors flux d'air.
      ledSled.emissiveIntensity = sledPhase > 0.4 ?
      3.2 + Math.sin(t / 90) * 1.6 :
      2.3 + Math.sin(t / 780) * 1.2;
    },
    dispose: () => stage.dispose()
  };
}

export const RACK_PRODUCT: ProductDefinition = {
  id: 'baie-serveur',
  name: 'Baie serveur 42U',
  reference: 'EDGE-42',
  entity: 'FRELAR CLOUD & OPS',
  category: 'it',
  glyph: 'rack',
  tagline: 'Nœud d’exploitation sous tension : serveurs sur glissières, commutateur brassé, console KVM, onduleur et guidage des câbles.',
  target: [0, 1.02, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.7, phi: 0.28, radius: 4.4 },
  { id: 'face', label: 'Face avant', theta: 0, phi: 0.12, radius: 3.6 },
  { id: 'serveur', label: 'Serveur extrait', theta: 0.5, phi: 0.34, radius: 2.6 },
  { id: 'reseau', label: 'Brassage', theta: 0.15, phi: 0.05, radius: 2.1 },
  { id: 'onduleur', label: 'Onduleur', theta: 0.2, phi: -0.12, radius: 2.2 },
  { id: 'arriere', label: 'Arrière', theta: 3.05, phi: 0.24, radius: 3.8 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x18293e, swatch: '#18293e' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  {
    id: 'serveur',
    label: 'Serveur de calcul 2U',
    value: '2 × 32 cœurs · 512 Go',
    position: [0, 1.4, -0.53],
    normal: [0, 0.25, -0.97],
    side: 'left',
    part: 'sled'
  },
  {
    id: 'disques',
    label: 'Baies NVMe hot-swap',
    value: '4 × 3,84 To · RAID 10',
    position: [-0.16, 1.4, -0.54],
    normal: [-0.3, 0, -0.95],
    side: 'left',
    part: 'sled'
  },
  {
    id: 'commutateur',
    label: 'Commutateur 24 ports',
    value: '10 GbE · agrégation LACP',
    position: [0.1, 1.55, -0.53],
    normal: [0.2, -0.1, -0.97],
    side: 'right'
  },
  {
    id: 'brassage',
    label: 'Panneau de brassage',
    value: '24 keystone · repérage par voie',
    position: [-0.12, 1.45, -0.53],
    normal: [-0.25, -0.15, -0.96],
    side: 'left'
  },
  {
    id: 'console',
    label: 'Console KVM escamotable',
    value: 'Accès hors réseau · 1U',
    position: [0.06, 1.32, -0.56],
    normal: [0.1, 0.45, -0.89],
    side: 'right'
  },
  {
    id: 'onduleur',
    label: 'Onduleur en ligne',
    value: '6 kVA · autonomie 22 min',
    position: [0.1, 0.36, -0.54],
    normal: [0.2, -0.25, -0.95],
    side: 'right'
  },
  {
    id: 'alimentation',
    label: 'Alimentation redondée',
    value: '2 voies · 28 prises supervisées',
    position: [0.27, 1.6, 0.44],
    normal: [0.75, 0.1, 0.65],
    side: 'right'
  },
  {
    id: 'ventilation',
    label: 'Extraction en toiture',
    value: '4 ventilateurs · flux avant/arrière',
    position: [0, 2.18, 0],
    normal: [0, 1, 0.1],
    side: 'right'
  },
  {
    id: 'sonde',
    label: 'Sonde température & humidité',
    value: 'Alerte à 27 °C · supervisée 24/7',
    position: [-0.22, 1.95, -0.3],
    normal: [-0.6, 0.3, -0.74],
    side: 'left'
  },
  {
    id: 'masse',
    label: 'Tresse de masse',
    value: 'Liaison équipotentielle 16 mm²',
    position: [-0.28, 0.32, 0.4],
    normal: [-0.6, -0.1, 0.79],
    side: 'left'
  },
  {
    id: 'obturateur',
    label: 'Obturateurs d’airflow',
    value: 'U libres fermés · pas de recirculation',
    position: [-0.05, 0.62, -0.53],
    normal: [0, -0.2, -0.98],
    side: 'left'
  },
  {
    id: 'cablage',
    label: 'Guidage des câbles',
    value: '5 bras · faisceaux repérés',
    position: [0, 0.96, 0.4],
    normal: [0.1, 0, 0.99],
    side: 'right'
  }],

  dimensions: [
  { id: 'hauteur', value: '2 020 mm · 42U', from: [-0.34, 0.075, -0.53], to: [-0.34, 2.095, -0.53], bias: [-1, 0] },
  { id: 'largeur', value: '620 mm', from: [-0.31, 0.075, -0.53], to: [0.31, 0.075, -0.53], bias: [0, 1] },
  { id: 'course', value: '720 mm de course', from: [0.36, 1.4, -0.53], to: [0.36, 1.4, 0.19], bias: [1, 0] }],

  specs: [
  { label: 'Référence', value: 'EDGE-42' },
  { label: 'Hauteur utile', value: '42U · 2 020 mm' },
  { label: 'Charge admissible', value: '1 200 kg' },
  { label: 'Réseau', value: '24 ports 10 GbE brassés' },
  { label: 'Alimentation', value: '2 voies · onduleur 6 kVA' },
  { label: 'Extraction', value: '4 ventilateurs en toiture' },
  { label: 'Supervision', value: 'Sondes température & humidité' },
  { label: 'Astreinte', value: '24/7 · rétablissement contractuel' }],

  demo: {
    idle: 'Extraire un serveur',
    active: 'Réinsérer le serveur',
    hint: 'Baie sous tension · porte déverrouillée puis glissières : 720 mm'
  },
  build
};
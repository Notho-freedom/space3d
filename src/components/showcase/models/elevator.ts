import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Ascenseur à traction « ELV-9 » — FRELAR SYSTEMS.
 *
 * Trois niveaux desservis sur une gaine de près de cinq mètres : la course est
 * assez longue pour qu'on voie réellement la mécanique travailler — la poulie
 * d'adhérence qui tourne, les câbles qui se déroulent, le contrepoids qui
 * descend exactement de ce que la cabine monte. La mise en service joue le
 * cycle complet, portes comprises.
 */
const CABIN_LOW = 0.78;
const CABIN_MID = 2.36;
const CABIN_HIGH = 3.94;
const CW_LOW = 0.52;
const CW_HIGH = 3.68;
const SHEAVE_Y = 4.92;
const SHEAVE_R = 0.32;
const SHAFT_TOP = 4.66;

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}

const smooth = (v: number) => v * v * (3 - 2 * v);

function build(): BuiltModel {
  const stage = new Stage();
  const shellMat = stage.standard(0x8ea3b4, 0.96, 0.28);
  const frameMat = stage.standard(0x7f95a7, 0.96, 0.32);
  const steel = stage.standard(0xa8bccb, 1, 0.22);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const rubber = stage.standard(0x0c0f14, 0.2, 0.9);
  const glass = stage.mat(
    new THREE.MeshStandardMaterial({
      color: 0x69c7ec,
      metalness: 0.1,
      roughness: 0.06,
      transparent: true,
      opacity: 0.2
    })
  );

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const CYAN = 0x4de0ff;
  const cabinLight = led(0xdcf1ff, 2.1, 0.1, 3600);
  const railGlow = led(CYAN, 1.1, 0.3, 2600, 200);
  const panelMat = led(CYAN, 1.6, 0.25, 2800, 120);
  const alertMat = led(0xe30613, 2.3, 0.9, 900, 60);
  const okMat = led(0x36d399, 2.1, 0.35, 1900, 240);
  const doorEdge = led(CYAN, 1.8, 0.4, 1500, 320);

  /* ═══ Fosse et embase ═══ */
  stage.box(2.06, 0.08, 1.78, 0, 0.04, 0, frameMat);
  stage.box(1.78, 0.02, 1.5, 0, 0.09, 0, dark);
  [-0.32, 0.32].forEach((x) => {
    stage.cylinder(0.09, 0.12, 0.28, x, 0.23, 0.08, steel, stage.group, 16);
    for (let c = 0; c < 6; c += 1) {
      stage.torus(0.1, 0.012, x, 0.14 + c * 0.04, 0.08, steel).rotation.x = Math.PI / 2;
    }
    stage.cylinder(0.12, 0.12, 0.05, x, 0.39, 0.08, rubber, stage.group, 16);
  });
  stage.contactShadow(6.4, 5.6, 0, 0);
  stage.rings(2.35, 0, 0);

  /* ═══ Charpente de gaine ═══ */
  const posts: [number, number][] = [
  [-0.78, -0.75],
  [0.78, -0.75],
  [-0.78, 0.75],
  [0.78, 0.75]];

  posts.forEach(([x, z]) => {
    stage.ibeam(SHAFT_TOP - 0.06, 0.16, 0.13, 'y', x, (SHAFT_TOP + 0.06) / 2, z, frameMat);
    stage.box(0.26, 0.035, 0.26, x, 0.1, z, steel);
    [-0.07, 0.07].forEach((d) => stage.cylinder(0.015, 0.015, 0.025, x + d, 0.13, z + d, steel, stage.group, 8));
  });
  [1.16, 2.32, 3.48, SHAFT_TOP].forEach((y) => {
    stage.box(1.62, 0.06, 0.06, 0, y, -0.75, frameMat);
    stage.box(1.62, 0.06, 0.06, 0, y, 0.75, frameMat);
    stage.box(0.06, 0.06, 1.56, -0.78, y, 0, frameMat);
    stage.box(0.06, 0.06, 1.56, 0.78, y, 0, frameMat);
  });
  // Contreventement : une diagonale par travée, alternée côté arrière.
  [0, 1, 2].forEach((bay) => {
    const brace = stage.box(1.7, 0.04, 0.04, 0, 0.58 + bay * 1.16, -0.75, steel);
    brace.rotation.z = bay % 2 === 0 ? 0.62 : -0.62;
  });

  /* ═══ Guides : rails cabine T89 et rails contrepoids ═══ */
  [-0.68, 0.68].forEach((x) => {
    stage.box(0.07, 4.42, 0.15, x, 2.36, 0.1, steel);
    stage.box(0.13, 4.42, 0.04, x, 2.36, 0.195, steel);
    for (let i = 0; i < 8; i += 1) {
      stage.box(0.14, 0.07, 0.09, x, 0.5 + i * 0.58, 0.03, frameMat);
      [-0.04, 0.04].forEach((d) => stage.cylinder(0.012, 0.012, 0.02, x + d, 0.5 + i * 0.58, 0.08, steel, stage.group, 8));
    }
    stage.box(0.016, 4.2, 0.016, x, 2.36, 0.222, railGlow);
  });
  [-0.36, 0.36].forEach((x) => {
    stage.box(0.05, 4.1, 0.09, x, 2.3, -0.54, steel);
    for (let i = 0; i < 6; i += 1) stage.box(0.1, 0.05, 0.06, x, 0.6 + i * 0.72, -0.6, frameMat);
  });

  /* ═══ Cabine ═══ */
  const cabin = stage.group3(stage.group, 0, CABIN_LOW, 0.12);
  stage.box(1.08, 0.07, 0.98, 0, -0.63, 0, frameMat, cabin);
  stage.box(0.98, 0.02, 0.88, 0, -0.585, 0, dark, cabin);
  stage.box(1.08, 0.07, 0.98, 0, 0.63, 0, shellMat, cabin);
  stage.box(0.76, 0.014, 0.66, 0, 0.592, 0, cabinLight, cabin);
  stage.box(1.04, 1.22, 0.05, 0, 0, -0.465, shellMat, cabin);
  stage.box(0.86, 0.96, 0.014, 0, 0.03, -0.432, glass, cabin);
  [-0.5, 0.5].forEach((x) => {
    stage.box(0.05, 1.22, 0.94, x, 0, 0, shellMat, cabin);
    stage.box(0.014, 0.94, 0.74, x - Math.sign(x) * 0.03, 0.03, -0.02, glass, cabin);
  });
  // Main courante sur trois faces et plinthe éclairée.
  const rail = stage.cylinder(0.02, 0.02, 0.92, 0, -0.08, -0.4, steel, cabin, 12);
  rail.rotation.z = Math.PI / 2;
  [-0.44, 0.44].forEach((x) => {
    const side = stage.cylinder(0.02, 0.02, 0.78, x, -0.08, -0.04, steel, cabin, 12);
    side.rotation.x = Math.PI / 2;
  });
  stage.box(0.94, 0.016, 0.014, 0, -0.545, 0.46, doorEdge, cabin);

  // Brancard, attaches de câbles, limiteur, coulisseaux, parachute.
  stage.box(1.16, 0.08, 1.06, 0, 0.7, 0, steel, cabin);
  [-0.17, 0.17].forEach((x) => {
    stage.cylinder(0.036, 0.036, 0.12, x, 0.78, -0.02, steel, cabin, 12);
    stage.box(0.09, 0.04, 0.09, x, 0.85, -0.02, dark, cabin);
    stage.cylinder(0.05, 0.05, 0.03, x, 0.88, -0.02, steel, cabin, 14);
  });
  stage.box(0.18, 0.13, 0.18, 0.36, 0.8, 0.24, dark, cabin);
  stage.cylinder(0.075, 0.075, 0.04, 0.36, 0.89, 0.24, steel, cabin, 18);
  [-0.68, 0.68].forEach((x) => {
    [0.6, -0.6].forEach((y) => {
      stage.box(0.15, 0.11, 0.2, x, y, -0.02, dark, cabin);
      stage.box(0.05, 0.04, 0.24, x, y, -0.02, steel, cabin);
    });
  });
  [-0.62, 0.62].forEach((x) => stage.box(0.16, 0.12, 0.14, x, -0.62, -0.02, x < 0 ? alertMat : dark, cabin));

  const doors = stage.group3(cabin, 0, 0, 0.48);
  const doorLeft = stage.group3(doors, -0.24, 0, 0);
  const doorRight = stage.group3(doors, 0.24, 0, 0);
  [doorLeft, doorRight].forEach((panel) => {
    stage.box(0.48, 1.14, 0.04, 0, -0.02, 0, shellMat, panel);
    stage.box(0.36, 0.82, 0.014, 0, 0.08, 0.028, glass, panel);
    stage.box(0.48, 0.016, 0.05, 0, 0.56, 0, doorEdge, panel);
    stage.box(0.03, 1.14, 0.05, Math.sign(panel.position.x) * 0.235, -0.02, 0.006, steel, panel);
  });
  stage.box(1.08, 0.06, 0.07, 0, 0.61, 0.48, frameMat, cabin);
  stage.box(1.08, 0.05, 0.07, 0, -0.61, 0.48, steel, cabin);
  stage.box(0.7, 0.06, 0.08, 0, 0.72, 0.42, steel, cabin);
  stage.cylinder(0.05, 0.05, 0.09, -0.26, 0.78, 0.42, dark, cabin, 14).rotation.z = Math.PI / 2;

  // Boîte à boutons intérieure.
  stage.box(0.035, 0.44, 0.18, 0.5, 0.02, 0.28, dark, cabin);
  stage.box(0.01, 0.1, 0.13, 0.522, 0.18, 0.28, panelMat, cabin);
  const carButtons: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 3; i += 1) {
    const buttonMat = led(i === 0 ? CYAN : 0x14304a, i === 0 ? 1.8 : 0.05, 0, 4000);
    carButtons.push(buttonMat);
    stage.cylinder(0.017, 0.017, 0.01, 0.524, 0.06 - i * 0.07, 0.28, buttonMat, cabin, 12).rotation.z = Math.PI / 2;
  }
  stage.cylinder(0.015, 0.015, 0.01, 0.524, -0.16, 0.28, alertMat, cabin, 12).rotation.z = Math.PI / 2;

  /* ═══ Contrepoids ═══ */
  const counterweight = stage.group3(stage.group, 0, CW_HIGH, -0.54);
  stage.box(0.62, 0.56, 0.2, 0, 0, 0, dark, counterweight);
  for (let i = 0; i < 6; i += 1) {
    stage.box(0.55, 0.07, 0.23, 0, -0.21 + i * 0.085, 0, steel, counterweight);
  }
  [0.31, -0.31].forEach((y) => stage.box(0.68, 0.06, 0.24, 0, y, 0, frameMat, counterweight));
  [-0.31, 0.31].forEach((x) => {
    stage.box(0.06, 0.62, 0.08, x, 0, 0, frameMat, counterweight);
    [0.28, -0.28].forEach((y) => stage.box(0.1, 0.08, 0.13, x, y, 0, dark, counterweight));
  });
  [-0.17, 0.17].forEach((x) => stage.cylinder(0.028, 0.028, 0.09, x, 0.37, 0, steel, counterweight, 12));

  /* ═══ Machinerie haute ═══ */
  const machine = stage.group3(stage.group, 0, 0, 0);
  // Plancher ajouré : la trémie centrale laisse descendre les câbles.
  [-0.66, 0.66].forEach((z) => stage.box(1.9, 0.09, 0.28, 0, 4.72, z, frameMat, machine));
  [-0.8, 0.8].forEach((x) => stage.box(0.24, 0.09, 1.66, x, 4.72, 0, frameMat, machine));
  stage.box(0.62, 0.11, 0.56, -0.5, 4.74, -0.22, frameMat, machine);
  stage.box(0.54, 0.02, 0.48, -0.5, 4.8, -0.22, dark, machine);

  const motor = stage.cylinder(0.24, 0.24, 0.58, -0.5, SHEAVE_Y, -0.22, shellMat, machine, 28);
  motor.rotation.z = Math.PI / 2;
  for (let i = 0; i < 11; i += 1) {
    const fin = stage.torus(0.253, 0.01, -0.76 + i * 0.052, SHEAVE_Y, -0.22, steel, machine);
    fin.rotation.y = Math.PI / 2;
  }
  stage.box(0.2, 0.26, 0.26, -0.88, SHEAVE_Y, -0.22, dark, machine);
  stage.box(0.06, 0.08, 0.08, -0.99, SHEAVE_Y, -0.22, okMat, machine);
  stage.box(0.24, 0.16, 0.3, -0.5, SHEAVE_Y + 0.3, -0.22, dark, machine);

  const sheave = stage.group3(machine, -0.02, SHEAVE_Y, -0.22);
  const wheel = stage.cylinder(SHEAVE_R, SHEAVE_R, 0.16, 0, 0, 0, steel, sheave, 36);
  wheel.rotation.z = Math.PI / 2;
  [-0.05, 0, 0.05].forEach((x) => {
    const groove = stage.torus(SHEAVE_R + 0.004, 0.01, x, 0, 0, dark, sheave);
    groove.rotation.y = Math.PI / 2;
  });
  for (let i = 0; i < 6; i += 1) {
    const spoke = stage.box(0.04, 0.56, 0.04, 0, 0, 0, dark, sheave);
    spoke.rotation.x = i / 6 * Math.PI;
  }
  stage.cylinder(0.06, 0.06, 0.42, 0, 0, 0, dark, sheave, 16).rotation.z = Math.PI / 2;
  [-0.1, 0.1].forEach((z) => stage.box(0.12, 0.3, 0.06, 0.24, SHEAVE_Y, -0.22 + z, alertMat, machine));
  const deflector = stage.cylinder(0.15, 0.15, 0.12, 0.02, 4.5, 0.28, steel, machine, 24);
  deflector.rotation.z = Math.PI / 2;
  const governor = stage.cylinder(0.11, 0.11, 0.05, 0.62, 4.94, 0.3, steel, machine, 20);
  governor.rotation.z = Math.PI / 2;
  stage.box(0.1, 0.2, 0.1, 0.62, 4.82, 0.3, dark, machine);

  /* ═══ Câbles de traction ═══ */
  const ropeMat = stage.standard(0x9aa9b6, 1, 0.3);
  const cabinRopes = [-0.17, 0.17].map((x) => stage.cylinder(0.013, 0.013, 1, x, 0, 0.1, ropeMat, stage.group, 8));
  const cwRopes = [-0.17, 0.17].map((x) => stage.cylinder(0.013, 0.013, 1, x, 0, -0.54, ropeMat, stage.group, 8));
  const setRope = (mesh: THREE.Mesh, topY: number, bottomY: number) => {
    const length = Math.max(0.001, topY - bottomY);
    mesh.scale.y = length;
    mesh.position.y = (topY + bottomY) / 2;
  };
  stage.cylinder(0.006, 0.006, 4.3, 0.62, 2.5, 0.3, steel, stage.group, 6);

  /* ═══ Exploitation : armoire, paliers, afficheurs d'étage ═══ */
  stage.box(0.44, 1.22, 0.36, 1.36, 0.65, 0.2, shellMat);
  stage.box(0.02, 0.62, 0.26, 1.585, 0.9, 0.2, dark);
  stage.box(0.008, 0.44, 0.2, 1.598, 0.94, 0.2, panelMat);
  [0.5, 0.42, 0.34].forEach((y, i) => {
    const lamp = stage.cylinder(0.02, 0.02, 0.012, 1.585, y, 0.2, i === 0 ? okMat : i === 1 ? panelMat : alertMat, stage.group, 14);
    lamp.rotation.z = Math.PI / 2;
  });
  stage.box(0.5, 0.05, 0.4, 1.36, 1.29, 0.2, steel);
  stage.box(0.3, 0.04, 0.24, 1.36, 1.34, 0.2, dark);

  const floorLamps: THREE.MeshStandardMaterial[] = [];
  [CABIN_LOW, CABIN_MID, CABIN_HIGH].forEach((y, i) => {
    stage.box(1.6, 0.06, 0.07, 0, y - 0.66, 0.86, frameMat);
    [-0.72, 0.72].forEach((x) => stage.box(0.07, 1.3, 0.07, x, y, 0.86, frameMat));
    stage.box(1.6, 0.07, 0.07, 0, y + 0.66, 0.86, frameMat);
    stage.box(0.14, 0.2, 0.04, 0.98, y + 0.5, 0.86, dark);
    const lampMat = led(i === 0 ? CYAN : 0x14304a, i === 0 ? 2.2 : 0.05, 0, 4000);
    floorLamps.push(lampMat);
    stage.box(0.1, 0.13, 0.01, 0.98, y + 0.5, 0.885, lampMat);
    stage.box(0.09, 0.16, 0.04, -0.98, y + 0.1, 0.86, dark);
    stage.cylinder(0.018, 0.018, 0.012, -0.98, y + 0.14, 0.885, i === 0 ? okMat : dark, stage.group, 12).rotation.x = Math.PI / 2;
  });

  return {
    group: stage.group,
    parts: { cabin, counterweight, machine, sheave },
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

      /* Cycle réel : on ferme, on monte, on rouvre. Une cabine qui se déplace
         portes ouvertes ne démontre rien — c'est l'enchaînement qui fait foi. */
      const open = Math.max(1 - clamp01(phase / 0.12), clamp01((phase - 0.9) / 0.1));
      const travel = smooth(clamp01((phase - 0.14) / 0.74));
      doorLeft.position.x = -0.24 - open * 0.29;
      doorRight.position.x = 0.24 + open * 0.29;

      const cabinY = CABIN_LOW + (CABIN_HIGH - CABIN_LOW) * travel;
      const cwY = CW_HIGH - (CW_HIGH - CW_LOW) * travel;
      cabin.position.y = cabinY;
      counterweight.position.y = cwY;
      // Un tour de poulie par 2πR de course : la rotation suit vraiment le câble.
      sheave.rotation.x = -((cabinY - CABIN_LOW) / SHEAVE_R);
      deflector.rotation.x = (cabinY - CABIN_LOW) / 0.15 * 0.5;

      cabinRopes.forEach((rope) => setRope(rope, SHEAVE_Y, cabinY + 0.84));
      cwRopes.forEach((rope) => setRope(rope, SHEAVE_Y, cwY + 0.38));

      const active = travel < 0.34 ? 0 : travel < 0.72 ? 1 : 2;
      floorLamps.forEach((lamp, index) => {
        const on = index === active;
        const hex = on ? CYAN : 0x14304a;
        lamp.emissiveIntensity = on ? 2.2 : 0.05;
        lamp.color.setHex(hex);
        lamp.emissive.setHex(hex);
      });
      carButtons.forEach((button, index) => {
        const on = index === 2 ? phase > 0.1 : index === active;
        const hex = on ? index === 2 ? 0xe30613 : CYAN : 0x14304a;
        button.emissiveIntensity = on ? 1.9 : 0.05;
        button.color.setHex(hex);
        button.emissive.setHex(hex);
      });
      cabinLight.emissiveIntensity = 1.7 + open * 0.6;
      doorEdge.emissiveIntensity = 1.1 + (1 - open) * 1.5;
      railGlow.emissiveIntensity = 0.7 + travel * 1.5;
    },
    dispose: () => stage.dispose()
  };
}

export const ELEVATOR_PRODUCT: ProductDefinition = {
  id: 'ascenseur-traction',
  name: 'Ascenseur à traction',
  reference: 'ELV-9',
  entity: 'FRELAR SYSTEMS',
  category: 'technique',
  glyph: 'elevator',
  tagline:
  'Chaîne de traction complète sur trois niveaux : treuil gearless, poulie d’adhérence, cabine guidée et contrepoids. La mise en service joue le cycle réel, portes comprises.',
  target: [0, 2.3, 0],
  views: [
  { id: 'trois-quarts', label: '3/4', theta: 0.72, phi: 0.14, radius: 10.6 },
  { id: 'face', label: 'Face', theta: 0.04, phi: 0.08, radius: 9.6 },
  { id: 'machinerie', label: 'Machinerie', theta: 0.95, phi: 0.5, radius: 6.4 },
  { id: 'cabine', label: 'Cabine', theta: 0.28, phi: 0.04, radius: 5.6 },
  { id: 'coupe', label: 'Coupe latérale', theta: 1.57, phi: 0.12, radius: 9.8 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  {
    id: 'treuil',
    label: 'Treuil gearless',
    value: 'Moteur à aimants permanents · 11 kW',
    position: [-0.5, 4.92, -0.22],
    normal: [-0.4, 0.4, 0.82],
    side: 'left'
  },
  {
    id: 'poulie',
    label: 'Poulie d’adhérence',
    value: 'Ø 640 mm · 3 gorges',
    position: [-0.02, 5.28, -0.22],
    normal: [0.2, 0.9, 0.39],
    side: 'right'
  },
  {
    id: 'cables',
    label: 'Câbles de traction',
    value: '4 brins Ø 10 mm · coefficient 12',
    position: [0.17, 4.1, 0.1],
    normal: [0.5, 0.2, 0.84],
    side: 'right'
  },
  {
    id: 'cabine',
    label: 'Cabine',
    value: '8 personnes · 630 kg',
    position: [0, 0.1, 0.52],
    normal: [0, 0.1, 0.99],
    side: 'left',
    part: 'cabin'
  },
  {
    id: 'contrepoids',
    label: 'Contrepoids',
    value: 'Cabine + 50 % de charge utile',
    position: [0, 0, -0.14],
    normal: [-0.4, 0.2, -0.89],
    side: 'left',
    part: 'counterweight'
  },
  {
    id: 'guides',
    label: 'Guides et coulisseaux',
    value: 'Rails T89 · jeu 0,5 mm',
    position: [0.68, 2.9, 0.2],
    normal: [0.7, 0.1, 0.71],
    side: 'right'
  },
  {
    id: 'armoire',
    label: 'Armoire de manœuvre',
    value: 'Variateur vectoriel · télésurveillance',
    position: [1.6, 0.94, 0.2],
    normal: [0.9, 0.2, 0.39],
    side: 'right'
  },
  {
    id: 'parachute',
    label: 'Parachute et limiteur',
    value: 'Prise sur rails à 115 % de la vitesse',
    position: [-0.62, 0.16, 0.1],
    normal: [-0.7, -0.1, 0.71],
    side: 'left'
  },
  {
    id: 'amortisseurs',
    label: 'Amortisseurs de fosse',
    value: 'Butée hydraulique · essai annuel',
    position: [-0.32, 0.3, 0.08],
    normal: [-0.6, 0.1, 0.79],
    side: 'left'
  }],

  dimensions: [
  { id: 'course', value: 'Course 3 160 mm', from: [-0.98, 0.78, 0.86], to: [-0.98, 3.94, 0.86], bias: [-1, 0] },
  { id: 'largeur', value: 'Cabine 1 100 mm', from: [-0.54, 0.2, 0.62], to: [0.54, 0.2, 0.62], bias: [0, 1] },
  { id: 'gaine', value: 'Gaine 4 660 mm', from: [0.78, 0.06, -0.75], to: [0.78, 4.72, -0.75], bias: [1, 0] }],

  specs: [
  { label: 'Référence', value: 'ELV-9' },
  { label: 'Niveaux', value: '3 desservis · course 3,16 m' },
  { label: 'Charge', value: '630 kg · 8 personnes' },
  { label: 'Vitesse', value: '1,6 m/s' },
  { label: 'Motorisation', value: 'Gearless à aimants permanents' },
  { label: 'Suspension', value: '4 câbles Ø 10 mm · 2:1' },
  { label: 'Précision d’arrêt', value: '± 3 mm' },
  { label: 'Sécurité', value: 'Parachute · limiteur · amortisseurs' },
  { label: 'Supervision', value: 'Télémétrie temps réel · maintenance prédictive' }],

  demo: {
    idle: 'Lancer la mise en service',
    active: 'Ramener au niveau 0',
    hint: 'Cycle complet : fermeture des portes, course sur trois niveaux, arrivée, réouverture'
  },
  build
};
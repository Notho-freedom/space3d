import * as THREE from 'three';
import type { BuiltModel, ProductDefinition } from '../types';
import { Stage, clamp01 } from './stage';

/**
 * Salle de données « DCR-52 » — FRELAR CLOUD & OPS.
 *
 * Quatre travées de baies sur une allée centrale qui se perd dans la brume :
 * la vue qu'on a vraiment en poussant la porte d'une salle en exploitation.
 * Chemins de câbles au plafond, liens optiques au sol d'un bout à l'autre de
 * la pièce, et chaque baie qui respire à son rythme. La mise en service met la
 * salle sous tension travée par travée — jamais tout d'un coup.
 */
const ROWS = [-3.3, -1.15, 1.15, 3.3];
const PER_ROW = 13;
const PITCH = 0.68;
const AISLES = [-2.22, 0, 2.22];
const HALL = PER_ROW * PITCH;

interface Pulse {
  material: THREE.MeshStandardMaterial;
  base: number;
  swing: number;
  period: number;
  offset: number;
}
interface RackLed {
  material: THREE.MeshStandardMaterial;
  at: number;
  seed: number;
  alert: boolean;
}
interface Bead {
  mesh: THREE.Mesh;
  from: number;
  to: number;
  offset: number;
  speed: number;
}

function build(): BuiltModel {
  const stage = new Stage();
  const shellMat = stage.standard(0x8ea3b4, 0.96, 0.3);
  const frameMat = stage.standard(0x7f95a7, 0.96, 0.34);
  const steel = stage.standard(0xa8bccb, 1, 0.22);
  const dark = stage.standard(0x0a1220, 0.5, 0.66);
  const floorMat = stage.standard(0x0d1622, 0.4, 0.72);

  const pulses: Pulse[] = [];
  const led = (color: number, base: number, swing: number, period: number, offset = 0) => {
    const material = stage.emissive(color, base);
    pulses.push({ material, base, swing, period, offset });
    return material;
  };
  const CYAN = 0x4de0ff;
  const aisleLight = led(0xcfe9fb, 1.6, 0.05, 5200);
  const stripMat = led(CYAN, 1, 0.2, 2600, 120);
  const alertMat = led(0xe30613, 2.2, 0.9, 900, 60);
  const okMat = led(0x36d399, 1.8, 0.3, 1900, 240);
  const fibreMat = led(CYAN, 1, 0.25, 1700, 260);
  const powerMat = led(0xffa53d, 1, 0.2, 2300, 400);

  /* ═══ Dalle technique et plénum ═══ */
  stage.box(9.9, 0.1, HALL + 2.4, 0, 0.05, 0, floorMat);
  stage.box(9.5, 0.02, HALL + 2, 0, 0.11, 0, dark);
  for (let i = 0; i < 9; i += 1) {
    const z = -HALL / 2 - 0.8 + i * ((HALL + 1.6) / 8);
    [-4.85, 4.85].forEach((x) => {
      stage.box(0.1, 0.1, 0.1, x, 0.05, z, steel);
      stage.cylinder(0.03, 0.03, 0.1, x, 0.05, z, dark, stage.group, 8);
    });
  }

  /* ═══ Baies : façades tournées vers les allées ═══ */
  const rackLeds: RackLed[] = [];
  ROWS.forEach((rowX, row) => {
    const facing = row < 2 ? 1 : -1;
    for (let i = 0; i < PER_ROW; i += 1) {
      const z = (i - (PER_ROW - 1) / 2) * PITCH;
      const at = i / PER_ROW;
      const alert = row === 1 && i === 8;
      stage.box(1.05, 2, 0.62, rowX, 1.11, z, shellMat);
      stage.box(0.04, 1.84, 0.56, rowX + facing * 0.53, 1.11, z, dark);
      const columnMat = led(alert ? 0xe30613 : CYAN, 0.3, 0, 2000);
      rackLeds.push({ material: columnMat, at, seed: row * 37 + i * 91, alert });
      stage.box(0.014, 1.5, 0.035, rowX + facing * 0.556, 1.11, z - 0.2, columnMat);
      const statusMat = led(alert ? 0xe30613 : 0x36d399, 0.3, 0, 2000);
      rackLeds.push({ material: statusMat, at, seed: row * 53 + i * 17, alert });
      stage.box(0.014, 0.05, 0.05, rowX + facing * 0.556, 1.86, z + 0.2, statusMat);
      stage.box(1.08, 0.07, 0.65, rowX, 2.15, z, frameMat);
    }
    [-1, 1].forEach((end) => {
      const z = end * (HALL / 2 + 0.03);
      stage.box(1.07, 2.06, 0.06, rowX, 1.11, z, frameMat);
      stage.box(0.36, 0.08, 0.02, rowX, 1.96, z + end * 0.05, stripMat);
    });
    stage.box(1.12, 0.12, HALL + 0.1, rowX, 0.16, 0, frameMat);
    stage.cylinder(0.02, 0.02, HALL, rowX + facing * 0.5, 0.28, 0, steel, stage.group, 8).rotation.x = Math.PI / 2;
  });

  /* ═══ Allées : bandeaux au sol, luminaires, confinement ═══ */
  AISLES.forEach((x, index) => {
    [-0.5, 0.5].forEach((side) => stage.box(0.05, 0.014, HALL + 1.6, x + side * 0.52, 0.12, 0, stripMat));
    for (let i = 0; i < 7; i += 1) {
      const z = (i - 3) * ((HALL + 1) / 6);
      stage.box(0.28, 0.06, 0.9, x, 3.02, z, frameMat);
      stage.box(0.22, 0.012, 0.8, x, 2.985, z, aisleLight);
      [-0.12, 0.12].forEach((d) => stage.cylinder(0.008, 0.008, 0.5, x + d, 3.3, z, steel, stage.group, 6));
    }
    if (index === 1) return;
    [-1, 1].forEach((end) => {
      const z = end * (HALL / 2 + 0.5);
      stage.box(1.06, 2.5, 0.06, x, 1.3, z, frameMat);
    });
  });

  /* ═══ Chemins de câbles : optique en haut, énergie en bas ═══ */
  AISLES.forEach((x) => {
    [2.62, 2.86].forEach((y, level) => {
      stage.box(0.62, 0.04, HALL + 2.2, x, y, 0, steel);
      [-0.31, 0.31].forEach((side) => stage.box(0.03, 0.09, HALL + 2.2, x + side, y + 0.05, 0, steel));
      for (let i = 0; i < 20; i += 1) {
        stage.box(0.6, 0.02, 0.03, x, y + 0.02, -HALL / 2 - 1 + i * ((HALL + 2) / 19), steel);
      }
      for (let c = 0; c < 4; c += 1) {
        const cable = stage.cylinder(0.026, 0.026, HALL + 2.2, x - 0.21 + c * 0.14, y + 0.08, 0, level === 0 ? dark : frameMat, stage.group, 8);
        cable.rotation.x = Math.PI / 2;
      }
    });
    for (let i = 0; i < 8; i += 1) {
      const z = (i - 3.5) * ((HALL + 1.6) / 7);
      [-0.3, 0.3].forEach((d) => stage.cylinder(0.014, 0.014, 0.9, x + d, 3.32, z, steel, stage.group, 6));
    }
  });

  /* ═══ Liens au sol : ils traversent la salle d'un bout à l'autre ═══ */
  const beads: Bead[] = [];
  const FROM = -HALL / 2 - 1.3;
  const TO = HALL / 2 + 1.3;
  AISLES.forEach((x, index) => {
    [-0.2, 0, 0.2].forEach((offset, lane) => {
      const optical = lane !== 1;
      const cable = stage.cylinder(0.022, 0.022, TO - FROM, x + offset, 0.15, 0, optical ? fibreMat : powerMat, stage.group, 8);
      cable.rotation.x = Math.PI / 2;
      for (let i = 0; i < 8; i += 1) {
        stage.box(0.06, 0.05, 0.03, x + offset, 0.15, FROM + 0.6 + i * ((TO - FROM - 1.2) / 7), steel);
      }
      const bead = stage.sphere(0.05, x + offset, 0.15, 0, optical ? fibreMat : powerMat);
      beads.push({
        mesh: bead,
        from: index % 2 === 0 ? FROM : TO,
        to: index % 2 === 0 ? TO : FROM,
        offset: lane * 0.31 + index * 0.17,
        speed: optical ? 0.00019 : 0.00011
      });
    });
    const high = stage.sphere(0.045, x, 2.72, 0, fibreMat);
    beads.push({ mesh: high, from: TO, to: FROM, offset: index * 0.4, speed: 0.00024 });
  });

  /* ═══ Tête de salle : tableau général et balise ═══ */
  const head = stage.group3(stage.group, 0, 0, -HALL / 2 - 1.55);
  stage.box(2.6, 2.3, 0.6, 0, 1.26, 0, shellMat, head);
  stage.box(2.64, 0.09, 0.64, 0, 2.44, 0, frameMat, head);
  [-0.86, 0, 0.86].forEach((x, i) => {
    stage.box(0.78, 2.06, 0.03, x, 1.26, 0.32, dark, head);
    stage.box(0.6, 0.28, 0.014, x, 2.1, 0.34, i === 1 ? stripMat : dark, head);
    for (let r = 0; r < 6; r += 1) {
      stage.box(0.62, 0.05, 0.02, x, 1.72 - r * 0.24, 0.34, steel, head);
      stage.box(0.05, 0.03, 0.014, x - 0.26, 1.72 - r * 0.24, 0.35, r === 4 && i === 2 ? alertMat : okMat, head);
    }
  });
  stage.box(2.7, 0.14, 0.7, 0, 0.12, 0, frameMat, head);
  stage.box(0.06, 0.7, 0.06, 1.5, 2.75, 0, frameMat, head);
  stage.cylinder(0.07, 0.07, 0.1, 1.5, 3.15, 0, alertMat, head, 16);

  stage.contactShadow(11.5, HALL + 3.5, 0, 0);

  return {
    group: stage.group,
    parts: { head },
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
      /* Montée en charge : la salle se réveille travée par travée, de la tête
         vers le fond. Une salle qui s'allume d'un bloc, ça n'existe pas. */
      rackLeds.forEach((entry) => {
        const local = clamp01((phase - entry.at * 0.42) / 0.58);
        const activity = 0.55 + 0.45 * Math.sin((t + entry.seed * 21) / (900 + entry.seed % 7 * 160));
        entry.material.emissiveIntensity = 0.18 + local * (entry.alert ? 2.6 : 1.5 + activity * 1.4);
      });
      beads.forEach((bead) => {
        const travel = ((t * bead.speed * (0.45 + phase) + bead.offset) % 1 + 1) % 1;
        bead.mesh.position.z = bead.from + (bead.to - bead.from) * travel;
        bead.mesh.scale.setScalar(0.7 + phase * 0.7);
      });
      aisleLight.emissiveIntensity = 1 + phase * 1.1;
      stripMat.emissiveIntensity = 0.6 + phase * 1.5;
      fibreMat.emissiveIntensity = 0.6 + phase * 1.4;
    },
    dispose: () => stage.dispose()
  };
}

export const DATACENTER_PRODUCT: ProductDefinition = {
  id: 'salle-de-donnees',
  name: 'Salle de données',
  reference: 'DCR-52',
  entity: 'FRELAR CLOUD & OPS',
  category: 'it',
  glyph: 'datacenter',
  tagline:
  'Quatre travées de baies sur allée centrale, chemins de câbles au plafond et liens optiques au sol : une salle en exploitation, mise sous tension travée par travée.',
  target: [0, 1.2, 0],
  fog: [7, 27],
  views: [
  { id: 'allee', label: 'Allée centrale', theta: 0, phi: 0.07, radius: 9.4 },
  { id: 'trois-quarts', label: '3/4', theta: 0.62, phi: 0.22, radius: 12.5 },
  { id: 'travee', label: 'Travée', theta: 1.45, phi: 0.16, radius: 11 },
  { id: 'plongee', label: 'Plongée', theta: 0.4, phi: 0.9, radius: 13 },
  { id: 'tete', label: 'Tête de salle', theta: 3.1, phi: 0.2, radius: 8.6 }],

  finishes: [
  { id: 'anthracite', label: 'Anthracite bleuté', hex: 0x1b2d44, swatch: '#1b2d44' },
  { id: 'encre', label: 'Encre profonde', hex: 0x0a1220, swatch: '#0a1220' },
  { id: 'rouge', label: 'Rouge FRELAR', hex: 0x9c1119, swatch: '#b5141d' },
  { id: 'acier', label: 'Acier brossé', hex: 0x8ea3b4, swatch: '#8ea3b4' }],

  hotspots: [
  { id: 'travees', label: 'Travées de baies', value: '52 baies · 4 travées alignées', position: [-1.15, 2.3, 1.4], normal: [-0.3, 0.5, 0.81], side: 'left' },
  { id: 'allee', label: 'Allée froide confinée', value: 'Air soufflé par le plénum · 22 °C', position: [0, 0.3, 1.2], normal: [0, 0.9, 0.44], side: 'right' },
  { id: 'chemins', label: 'Chemins de câbles', value: 'Optique en haut, énergie en bas', position: [0, 2.95, -1.4], normal: [0.2, 0.8, 0.57], side: 'right' },
  { id: 'liens', label: 'Liens au sol', value: 'Rocades monomode entre travées', position: [2.22, 0.2, 2.2], normal: [0.4, 0.6, 0.69], side: 'right' },
  { id: 'incident', label: 'Baie en alerte', value: 'Une baie dégradée n’arrête pas la salle', position: [-0.6, 1.9, 1.06], normal: [0.5, 0.3, 0.81], side: 'left' },
  { id: 'tableau', label: 'Tableau général', value: 'Double arrivée · départs protégés', position: [0, 2.3, -4.86], normal: [0.1, 0.5, 0.86], side: 'left' },
  { id: 'dalle', label: 'Dalle technique', value: 'Plancher surélevé · plénum de soufflage', position: [-4.3, 0.14, 0], normal: [-0.6, 0.7, 0.39], side: 'left' }],

  dimensions: [
  { id: 'allee', value: 'Allée 1 200 mm', from: [-0.6, 0.12, 3.6], to: [0.6, 0.12, 3.6], bias: [0, 1] },
  { id: 'baie', value: 'Baie 2 000 mm', from: [-1.15, 0.16, 4.6], to: [-1.15, 2.16, 4.6], bias: [-1, 0] },
  { id: 'salle', value: 'Salle 9 900 mm', from: [-4.95, 0.1, 4.9], to: [4.95, 0.1, 4.9], bias: [0, 1] }],

  specs: [
  { label: 'Référence', value: 'DCR-52' },
  { label: 'Capacité', value: '52 baies · 4 travées' },
  { label: 'Puissance', value: '6 kW par baie · 312 kW installés' },
  { label: 'Distribution', value: 'Double arrivée · bascule automatique' },
  { label: 'Refroidissement', value: 'Allée froide confinée · plénum' },
  { label: 'Câblage', value: 'Optique en dalle haute, énergie en dalle basse' },
  { label: 'Supervision', value: 'Température, humidité, énergie par baie' },
  { label: 'Sécurité', value: 'Détection très haute sensibilité · extinction gaz' }],

  demo: {
    idle: 'Mettre la salle sous tension',
    active: 'Repasser en veille',
    hint: 'Montée en charge travée par travée, de la tête de salle vers le fond'
  },
  build
};
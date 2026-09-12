import type { ModuleCategory, ProductDefinition } from './types';
import { DATACENTER_PRODUCT } from './models/datacenter';
import { RACK_PRODUCT } from './models/rack';
import { MESH_PRODUCT } from './models/mesh';
import { ELEVATOR_PRODUCT } from './models/elevator';
import { GENERATOR_PRODUCT } from './models/generator';
import { HVAC_PRODUCT } from './models/hvac';
import { SOLAR_PRODUCT } from './models/solar';
import { GATE_PRODUCT } from './models/gate';
import { BARRIER_PRODUCT } from './models/barrier';

/**
 * Index du CYBERSPACE, groupé par métier : informatique, technique, métallique.
 * Dans chaque famille, on entre par la pièce la plus reconnaissable.
 */
export const MODULES: ProductDefinition[] = [
DATACENTER_PRODUCT,
RACK_PRODUCT,
MESH_PRODUCT,
ELEVATOR_PRODUCT,
GENERATOR_PRODUCT,
HVAC_PRODUCT,
SOLAR_PRODUCT,
GATE_PRODUCT,
BARRIER_PRODUCT];


export function findModule(id: string | undefined): ProductDefinition | undefined {
  return id ? MODULES.find((module) => module.id === id) : undefined;
}

export interface CategoryEntry {
  id: ModuleCategory;
  label: string;
  short: string;
  code: string;
}

export const CATEGORIES: CategoryEntry[] = [
{ id: 'it', label: 'Informatique & réseau', short: 'Informatique', code: 'IT' },
{ id: 'technique', label: 'Technique & énergie', short: 'Technique', code: 'TEC' },
{ id: 'metallique', label: 'Métallique & forge', short: 'Métallique', code: 'MET' }];


export function categoryOf(id: ModuleCategory): CategoryEntry {
  return CATEGORIES.find((entry) => entry.id === id) ?? CATEGORIES[0];
}

export function countIn(id: ModuleCategory): number {
  return MODULES.filter((module) => module.category === id).length;
}

/** Finition posée par défaut : l'acier brossé, la dernière de chaque nuancier. */
export function defaultFinish(module: ProductDefinition) {
  return module.finishes[module.finishes.length - 1];
}
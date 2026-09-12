import * as THREE from 'three';
/**
 * Fabrique partagée par toutes les maquettes : primitives, matériaux, ombre de
 * contact et cerclage technique. Elle tient aussi le registre des ressources à
 * libérer, pour qu'aucun modèle ne fuite en mémoire au changement de produit.
 */
export class Stage {
  readonly group = new THREE.Group();
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];
  private textures: THREE.Texture[] = [];
  mat<T extends THREE.Material>(material: T): T {
    this.materials.push(material);
    return material;
  }
  standard(color: number, metalness = 0.9, roughness = 0.36): THREE.MeshStandardMaterial {
    return this.mat(new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness
    }));
  }
  emissive(color: number, intensity = 2.2): THREE.MeshStandardMaterial {
    return this.mat(new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.4
    }));
  }
  group3(parent: THREE.Object3D = this.group, x = 0, y = 0, z = 0): THREE.Group {
    const child = new THREE.Group();
    child.position.set(x, y, z);
    parent.add(child);
    return child;
  }
  box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = this.group): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(w, h, d);
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  cylinder(radiusTop: number, radiusBottom: number, height: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = this.group, segments = 24): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  sphere(radius: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = this.group): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 18, 18);
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  /** Prise en charge d'une géométrie construite à la main (tube, ligne, treillis). */
  own<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry);
    return geometry;
  }
  /** Câble ou fibre : un tube suivant une courbe lissée. */
  tube(points: THREE.Vector3[], radius: number, material: THREE.Material, parent: THREE.Object3D = this.group, segments = 44): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = this.own(new THREE.TubeGeometry(curve, segments, radius, 8, false));
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    return mesh;
  }
  /** Treillis de liaisons : un seul appel de rendu pour des centaines d'arêtes. */
  lattice(pairs: [THREE.Vector3, THREE.Vector3][], material: THREE.LineBasicMaterial, parent: THREE.Object3D = this.group): THREE.LineSegments {
    const positions = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], index) => {
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], index * 6);
    });
    const geometry = this.own(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const lines = new THREE.LineSegments(geometry, this.mat(material));
    parent.add(lines);
    return lines;
  }
  torus(radius: number, tube: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = this.group, arc = Math.PI * 2): THREE.Mesh {
    const geometry = new THREE.TorusGeometry(radius, tube, 12, 40, arc);
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  /** Profilé en I approché par âme + deux semelles : lit bien mieux qu'une boîte. */
  ibeam(length: number, height: number, flange: number, axis: 'x' | 'y', x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = this.group): THREE.Group {
    const holder = this.group3(parent, x, y, z);
    if (axis === 'x') {
      this.box(length, height - 0.04, 0.022, 0, 0, 0, material, holder);
      this.box(length, 0.028, flange, 0, height / 2 - 0.014, 0, material, holder);
      this.box(length, 0.028, flange, 0, -height / 2 + 0.014, 0, material, holder);
    } else {
      this.box(0.022, length, height - 0.04, 0, 0, 0, material, holder);
      this.box(flange, length, 0.028, 0, 0, height / 2 - 0.014, material, holder);
      this.box(flange, length, 0.028, 0, 0, -height / 2 + 0.014, material, holder);
    }
    return holder;
  }
  /** Ombre douce au sol, indépendante des lumières : ancre la pièce au plan. */
  contactShadow(width: number, depth: number, x = 0, z = 0): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(4,10,18,0.6)');
    gradient.addColorStop(0.5, 'rgba(4,10,18,0.26)');
    gradient.addColorStop(1, 'rgba(4,10,18,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    const geometry = new THREE.PlaneGeometry(width, depth);
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, this.mat(new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.012, z);
    this.group.add(mesh);
  }
  /** Cerclage technique discret : donne l'échelle sans dessiner de grille. */
  rings(outer: number, x = 0, z = 0): void {
    const build = (inner: number, out: number, color: number, opacity: number) => {
      const geometry = new THREE.RingGeometry(inner, out, 96);
      this.geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, this.mat(new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false
      })));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.014, z);
      this.group.add(mesh);
    };
    build(outer, outer + 0.03, 0xe30613, 0.4);
    build(outer * 0.79, outer * 0.79 + 0.015, 0x7fa6d0, 0.18);
  }
  dispose(): void {
    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.textures.forEach((texture) => texture.dispose());
  }
}
export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
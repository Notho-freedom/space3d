import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CameraView, ProductDefinition } from './types';
import { createBrandWatermark } from './brandWatermark';

/**
 * Scène du CYBERSPACE : moteur WebGL nu, entièrement piloté par ses props.
 *
 * Aucune commande n'est rendue ici — le HUD vit à côté et pousse son état.
 * La scène n'apporte que trois choses au modèle : la grille de l'univers, la
 * brume qui lui donne sa profondeur, et le calque d'annotation projeté à
 * chaque image (repères techniques et cotes).
 */
const MIN_RADIUS_RATIO = 0.5;
const MAX_RADIUS_RATIO = 1.85;
const MIN_PHI = 0.04;
const MAX_PHI = 1.3;
const VOID = 0x03060c;

export interface CyberStageProps {
  product: ProductDefinition;
  /** Rotation d'orbite continue. */
  autoRotate?: boolean;
  showHotspots?: boolean;
  showDimensions?: boolean;
  /** Mise en service : 0 au repos, 1 en position finale. */
  phase?: number;
  finishHex?: number;
  /** Vue visée. Tout changement de `viewNonce` réarme la caméra dessus. */
  view?: CameraView | null;
  viewNonce?: number;
  zoom?: number;
  interactive?: boolean;
  /** Décalage latéral du sujet, en fraction de largeur (positif = vers la droite). */
  pan?: number;
  onUserOrbit?: () => void;
  onReady?: () => void;
  className?: string;
}

export function CyberStage({
  product,
  autoRotate = true,
  showHotspots = false,
  showDimensions = false,
  phase = 0,
  finishHex,
  view = null,
  viewNonce = 0,
  zoom = 1,
  interactive = true,
  pan = 0,
  onUserOrbit,
  onReady,
  className = 'relative h-full w-full'
}: CyberStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leaderRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const dimLineRefs = useRef<(SVGLineElement | null)[]>([]);
  const dimWitnessRefs = useRef<(SVGGElement | null)[]>([]);
  const dimChipRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* État lu par la boucle de rendu : passer par une ref évite de reconstruire
     la scène à chaque bascule du HUD. */
  const liveRef = useRef({ autoRotate, showHotspots, showDimensions, phase, interactive });
  liveRef.current.autoRotate = autoRotate;
  liveRef.current.showHotspots = showHotspots;
  liveRef.current.showDimensions = showDimensions;
  liveRef.current.phase = phase;
  liveRef.current.interactive = interactive;

  const first = product.views[0];
  const targetRef = useRef({
    theta: first.theta,
    phi: first.phi,
    radius: first.radius * zoom
  });
  const viewRef = useRef<CameraView | null>(view);
  viewRef.current = view;
  const setFinishRef = useRef<((hex: number) => void) | null>(null);
  const orbitRef = useRef(onUserOrbit);
  orbitRef.current = onUserOrbit;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  /* Réarmement de la caméra : la vue est une commande, pas un état continu. */
  useEffect(() => {
    const wanted = viewRef.current ?? product.views[0];
    targetRef.current.theta = wanted.theta;
    targetRef.current.phi = wanted.phi;
    targetRef.current.radius = wanted.radius * zoom;
  }, [viewNonce, product, zoom]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(VOID, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    /* En scène non interactive, le canevas rend le geste à la page : sur
       mobile, une vitrine qui capte le toucher empêche de faire défiler. */
    renderer.domElement.style.touchAction = interactive ? 'none' : 'auto';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
    const model = product.build();
    setFinishRef.current = model.setFinish;
    scene.add(model.group);

    const baseRadius = product.views[0].radius * zoom;
    const scale = product.views[0].radius / 7.6;

    /* Brume : elle creuse la profondeur derrière la pièce. Réglée sur le rayon
       caméra, sauf pour les modules qui s'étendent au loin et déclarent leur
       propre distance de fuite. */
    scene.fog = product.fog ?
    new THREE.Fog(VOID, product.fog[0], product.fog[1]) :
    new THREE.Fog(VOID, baseRadius * 1.3, baseRadius * 5);

    /* ═══ Éclairage : clé froide portante, remplissage, liserés de charte ═══ */
    scene.add(new THREE.HemisphereLight(0xbcd8f0, 0x050a12, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 2.05);
    key.position.set(5.5 * scale, 8 * scale, 5 * scale);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8 * scale;
    key.shadow.camera.right = 8 * scale;
    key.shadow.camera.top = 8 * scale;
    key.shadow.camera.bottom = -4 * scale;
    key.shadow.camera.far = 40 * scale;
    key.shadow.bias = -0.0012;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4f86bd, 0.7);
    fill.position.set(-6 * scale, 4 * scale, 3 * scale);
    scene.add(fill);
    const rimRed = new THREE.PointLight(0xe30613, 34 * scale * scale, 15 * scale, 2);
    rimRed.position.set(4.2 * scale, 1.6 * scale, -3.6 * scale);
    scene.add(rimRed);
    const rimCyan = new THREE.PointLight(0x4de0ff, 22 * scale * scale, 15 * scale, 2);
    rimCyan.position.set(-4.6 * scale, 2.4 * scale, -3.2 * scale);
    scene.add(rimCyan);

    const groundGeometry = new THREE.PlaneGeometry(120 * scale, 120 * scale);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const ground = new THREE.Mesh(groundGeometry, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Filigrane de marque au sol : le même symbole que celui du HUD. */
    const brand = createBrandWatermark();
    const watermarkGeometry = new THREE.PlaneGeometry(6.2 * scale, 6.2 * scale);
    const watermarkMat = new THREE.MeshBasicMaterial({
      map: brand.texture,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      fog: false
    });
    const watermark = new THREE.Mesh(watermarkGeometry, watermarkMat);
    watermark.rotation.x = -Math.PI / 2;
    watermark.position.set(0, 0.02, 0);
    scene.add(watermark);

    const target = new THREE.Vector3(...product.target);
    let theta = targetRef.current.theta;
    let phi = targetRef.current.phi;
    let radius = baseRadius * 1.32;
    let livePhase = 0;

    const interaction = { active: false, resumeAt: 0 };
    const projected = new THREE.Vector3();
    const worldPoint = new THREE.Vector3();
    const worldNormal = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    const resolveHost = (part?: string): THREE.Object3D => {
      const candidate = part ? model.parts?.[part] : undefined;
      return candidate && (candidate as THREE.Object3D).isObject3D ? candidate : model.group;
    };
    const hosts = product.hotspots.map((hotspot) => resolveHost(hotspot.part));
    const anchors = product.hotspots.map((hotspot) => ({
      point: new THREE.Vector3(...hotspot.position),
      normal: new THREE.Vector3(...hotspot.normal).normalize()
    }));
    const dimensionHosts = product.dimensions.map((dimension) => resolveHost(dimension.part));
    const dimensionPoints = product.dimensions.map((dimension) => ({
      from: new THREE.Vector3(...dimension.from),
      to: new THREE.Vector3(...dimension.to),
      bias: dimension.bias
    }));

    let width = 1;
    let height = 1;
    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      /* On déporte la fenêtre de projection, jamais la caméra : translater
         après `lookAt` inclinerait la pièce. */
      if (pan !== 0) camera.setViewOffset(width, height, -pan * width, 0, width, height);else
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const project = (vector: THREE.Vector3) => {
      projected.copy(vector).project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * width,
        y: (-projected.y * 0.5 + 0.5) * height
      };
    };

    const updateOverlay = () => {
      const hotspotsVisible = liveRef.current.showHotspots;
      anchors.forEach((anchor, index) => {
        const dot = dotRefs.current[index];
        const label = labelRefs.current[index];
        const leader = leaderRefs.current[index];
        if (!dot || !label || !leader) return;
        const host = hosts[index];
        worldPoint.copy(anchor.point);
        host.localToWorld(worldPoint);
        const screen = project(worldPoint);
        host.getWorldQuaternion(quaternion);
        worldNormal.copy(anchor.normal).applyQuaternion(quaternion);
        toCamera.copy(camera.position).sub(worldPoint).normalize();
        const facing = worldNormal.dot(toCamera);
        const visible = hotspotsVisible && facing > 0.06;
        const opacity = visible ? String(Math.min(1, (facing - 0.06) * 5)) : '0';
        const side = product.hotspots[index].side === 'right' ? 1 : -1;
        const dx = side * (width < 760 ? 78 : 128);
        const dy = index % 2 === 0 ? -60 : -34;
        dot.style.transform = `translate(${screen.x}px, ${screen.y}px) translate(-50%, -50%)`;
        dot.style.opacity = opacity;
        label.style.transform = `translate(${screen.x + dx}px, ${screen.y + dy}px) translate(${side === 1 ? '0' : '-100%'}, -50%)`;
        label.style.opacity = opacity;
        leader.setAttribute('points', `${screen.x},${screen.y} ${screen.x + dx * 0.5},${screen.y + dy} ${screen.x + dx},${screen.y + dy}`);
        leader.style.opacity = visible ? String(Number(opacity) * 0.9) : '0';
      });
      const dimensionsVisible = liveRef.current.showDimensions;
      dimensionPoints.forEach((dimension, index) => {
        const line = dimLineRefs.current[index];
        const witness = dimWitnessRefs.current[index];
        const chip = dimChipRefs.current[index];
        if (!line || !witness || !chip) return;
        if (!dimensionsVisible) {
          line.style.opacity = '0';
          witness.style.opacity = '0';
          chip.style.opacity = '0';
          return;
        }
        const host = dimensionHosts[index];
        worldPoint.copy(dimension.from);
        host.localToWorld(worldPoint);
        const a = project(worldPoint);
        worldPoint.copy(dimension.to);
        host.localToWorld(worldPoint);
        const b = project(worldPoint);
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const length = Math.hypot(vx, vy) || 1;
        let nx = -vy / length;
        let ny = vx / length;
        if (nx * dimension.bias[0] + ny * dimension.bias[1] < 0) {
          nx = -nx;
          ny = -ny;
        }
        const gap = 30;
        const ax = a.x + nx * gap;
        const ay = a.y + ny * gap;
        const bx = b.x + nx * gap;
        const by = b.y + ny * gap;
        line.setAttribute('x1', String(ax));
        line.setAttribute('y1', String(ay));
        line.setAttribute('x2', String(bx));
        line.setAttribute('y2', String(by));
        line.style.opacity = '1';
        const [w1, w2] = Array.from(witness.children) as SVGLineElement[];
        w1.setAttribute('x1', String(a.x));
        w1.setAttribute('y1', String(a.y));
        w1.setAttribute('x2', String(a.x + nx * (gap + 8)));
        w1.setAttribute('y2', String(a.y + ny * (gap + 8)));
        w2.setAttribute('x1', String(b.x));
        w2.setAttribute('y1', String(b.y));
        w2.setAttribute('x2', String(b.x + nx * (gap + 8)));
        w2.setAttribute('y2', String(b.y + ny * (gap + 8)));
        witness.style.opacity = '1';
        chip.style.transform = `translate(${(ax + bx) / 2}px, ${(ay + by) / 2}px) translate(-50%, -50%)`;
        chip.style.opacity = '1';
      });
    };

    /* Une projection qui échoue ne doit jamais faire tomber la boucle : au bout
       de trois incidents, le calque s'efface et la scène continue de tourner. */
    let overlayFailures = 0;
    let overlayEnabled = true;
    const hideOverlay = () => {
      [...dotRefs.current, ...labelRefs.current, ...dimChipRefs.current].forEach((element) => {
        if (element) element.style.opacity = '0';
      });
      [...leaderRefs.current, ...dimLineRefs.current, ...dimWitnessRefs.current].forEach((element) => {
        if (element) element.style.opacity = '0';
      });
    };
    const safeUpdateOverlay = () => {
      if (!overlayEnabled) return;
      try {
        updateOverlay();
      } catch {
        overlayFailures += 1;
        if (overlayFailures > 2) {
          overlayEnabled = false;
          hideOverlay();
        }
      }
    };

    let frame = 0;
    let firstFrame = true;
    let renderFailures = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (width === 0 || height === 0) return;
      const goal = targetRef.current;
      const spinning = liveRef.current.autoRotate && !interaction.active && performance.now() > interaction.resumeAt;
      if (spinning && !reduced) goal.theta += 0.0032;
      theta += (goal.theta - theta) * 0.08;
      phi += (goal.phi - phi) * 0.09;
      radius += (goal.radius - radius) * 0.06;
      if (model.setPhase) {
        const wanted = liveRef.current.phase;
        livePhase += (wanted - livePhase) * (reduced ? 1 : 0.045);
        if (Math.abs(wanted - livePhase) < 0.001) livePhase = wanted;
        model.setPhase(livePhase);
      }
      camera.position.set(
        target.x + radius * Math.cos(phi) * Math.sin(theta),
        target.y + radius * Math.sin(phi),
        target.z + radius * Math.cos(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
      try {
        renderer.render(scene, camera);
      } catch {
        renderFailures += 1;
        if (renderFailures > 2) {
          cancelAnimationFrame(frame);
          hideOverlay();
          readyRef.current?.();
          return;
        }
      }
      safeUpdateOverlay();
      if (firstFrame) {
        firstFrame = false;
        mount.style.opacity = '1';
        readyRef.current?.();
      }
    };
    render();

    const canvas = renderer.domElement;
    let pointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let engaged = false;
    const onPointerDown = (event: PointerEvent) => {
      if (!liveRef.current.interactive) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      interaction.active = true;
      canvas.style.cursor = 'grabbing';
    };
    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      const goal = targetRef.current;
      goal.theta -= (event.clientX - lastX) * 0.006;
      goal.phi = Math.min(MAX_PHI, Math.max(MIN_PHI, goal.phi - (event.clientY - lastY) * 0.004));
      lastX = event.clientX;
      lastY = event.clientY;
      orbitRef.current?.();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      canvas.releasePointerCapture?.(event.pointerId);
      interaction.active = false;
      interaction.resumeAt = performance.now() + 2400;
      canvas.style.cursor = 'grab';
    };
    const onWheel = (event: WheelEvent) => {
      if (!liveRef.current.interactive || !engaged) return;
      event.preventDefault();
      interaction.resumeAt = performance.now() + 2400;
      const goal = targetRef.current;
      goal.radius = Math.min(
        baseRadius * MAX_RADIUS_RATIO,
        Math.max(baseRadius * MIN_RADIUS_RATIO, goal.radius + event.deltaY * 0.0035 * baseRadius * 0.16)
      );
    };
    const onEnter = () => {
      engaged = true;
    };
    const onLeave = () => {
      engaged = false;
      if (pointerId === null) interaction.resumeAt = performance.now() + 900;
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      scene.remove(model.group);
      model.dispose();
      groundGeometry.dispose();
      groundMat.dispose();
      watermarkGeometry.dispose();
      watermarkMat.dispose();
      brand.dispose();
      /* Sans libération explicite, chaque module laisse un contexte WebGL en
         attente : le navigateur en plafonne le nombre et finit par invalider
         les contextes vivants. */
      renderer.forceContextLoss?.();
      renderer.dispose();
      canvas.remove();
      setFinishRef.current = null;
    };
  }, [product, pan, zoom]);

  useEffect(() => {
    if (typeof finishHex === 'number') setFinishRef.current?.(finishHex);
  }, [finishHex, product]);

  /* Le conteneur porte la classe telle quelle : mélanger `relative` avec un
     `absolute` transmis produirait un conflit que Tailwind tranche à sa façon,
     pas à la nôtre. Tout appelant fournit donc son propre positionnement. */
  return (
    <div className={className}>
      <div
        ref={mountRef}
        className={`h-full w-full opacity-0 transition-opacity duration-500 ease-out ${interactive ? 'cursor-grab' : ''}`} />
      

      {/* Calque d'annotation : lignes de rappel et cotes, redessinées à chaque image. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <marker id="fc-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#e30613" />
          </marker>
          <marker id="fc-arrow-start" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto">
            <path d="M7,0 L0,3.5 L7,7 Z" fill="#e30613" />
          </marker>
        </defs>
        {product.hotspots.map((hotspot, index) =>
        <polyline
          key={`${product.id}-${hotspot.id}`}
          ref={(element) => {
            leaderRefs.current[index] = element;
          }}
          fill="none"
          stroke="rgba(77,224,255,0.55)"
          strokeWidth="1"
          strokeDasharray="1 3"
          style={{ opacity: 0 }} />

        )}
        {product.dimensions.map((dimension, index) =>
        <g key={`${product.id}-${dimension.id}`}>
            <g
            ref={(element) => {
              dimWitnessRefs.current[index] = element;
            }}
            style={{ opacity: 0 }}>
            
              <line stroke="rgba(227,6,19,0.45)" strokeWidth="1" />
              <line stroke="rgba(227,6,19,0.45)" strokeWidth="1" />
            </g>
            <line
            ref={(element) => {
              dimLineRefs.current[index] = element;
            }}
            stroke="#e30613"
            strokeWidth="1.2"
            markerStart="url(#fc-arrow-start)"
            markerEnd="url(#fc-arrow)"
            style={{ opacity: 0 }} />
          
          </g>
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {product.hotspots.map((hotspot, index) =>
        <React.Fragment key={`${product.id}-${hotspot.id}`}>
            <div
            ref={(element) => {
              dotRefs.current[index] = element;
            }}
            className="absolute left-0 top-0"
            style={{ opacity: 0 }}>
            
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--fc-red)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff2d3b] ring-1 ring-white/80" />
              </span>
            </div>
            <div
            ref={(element) => {
              labelRefs.current[index] = element;
            }}
            className="absolute left-0 top-0 w-[170px] rounded-lg border border-white/15 bg-[rgba(6,11,20,0.9)] px-3 py-2 backdrop-blur-sm sm:w-[205px]"
            style={{ opacity: 0 }}>
            
              <p className="font-display text-[10.5px] font-semibold leading-tight text-white sm:text-[11.5px]">
                {hotspot.label}
              </p>
              <p className="mt-1 font-mono-tech text-[9px] leading-tight text-[rgba(77,224,255,0.8)] sm:text-[10px]">
                {hotspot.value}
              </p>
            </div>
          </React.Fragment>
        )}
        {product.dimensions.map((dimension, index) =>
        <div
          key={`${product.id}-${dimension.id}`}
          ref={(element) => {
            dimChipRefs.current[index] = element;
          }}
          className="absolute left-0 top-0 rounded border border-[rgba(227,6,19,0.6)] bg-[rgba(6,11,20,0.92)] px-2 py-[3px] font-mono-tech text-[10px] font-semibold text-white"
          style={{ opacity: 0 }}>
          
            {dimension.value}
          </div>
        )}
      </div>
    </div>);

}
import * as THREE from 'three';
/**
 * Filigrane de marque destiné au sol des scènes 3D : le MÊME symbole que celui
 * posé en surimpression sur les bannières et le pied de page
 * (--frelar-watermark-src), pour que le branding soit reconnaissable d'une
 * surface à l'autre.
 *
 * Le fichier vit sur le CDN. Uploader directement une image d'une autre origine
 * dans WebGL peut lever une SecurityError selon les en-têtes servis, et la
 * scène entière s'arrête alors sur cette exception. On passe donc par
 * fetch → blob → canvas : le blob est de même origine, le canvas n'est jamais
 * contaminé, et la texture reste sûre à téléverser. En attendant le fichier —
 * ou s'il n'arrive pas — un lettrage sobre tient la place.
 */
const LOGO_SRC = "/frelar_final_corp_R.png";
export interface BrandWatermark {
  texture: THREE.CanvasTexture;
  dispose: () => void;
}
function drawFallback(ctx: CanvasRenderingContext2D, size: number) {
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.round(size * 0.11)}px Poppins, Arial, sans-serif`;
  ctx.fillText('FRELAR CORP', size / 2, size / 2);
}
export function createBrandWatermark(size = 1024): BrandWatermark {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  drawFallback(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  let cancelled = false;
  const paint = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number) => {
    if (cancelled || !sourceWidth || !sourceHeight) return;
    ctx.clearRect(0, 0, size, size);
    const fit = Math.min(size / sourceWidth, size / sourceHeight) * 0.94;
    const width = sourceWidth * fit;
    const height = sourceHeight * fit;
    ctx.drawImage(source, (size - width) / 2, (size - height) / 2, width, height);
    // Teinte blanche : l'équivalent du filtre `brightness(0) invert(1)` que le
    // filigrane CSS applique déjà sur fond sombre.
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    texture.needsUpdate = true;
  };
  fetch(LOGO_SRC, {
    mode: 'cors',
    cache: 'force-cache'
  }).then((response) => response.ok ? response.blob() : Promise.reject(new Error('logo indisponible'))).then((blob) => {
    if (cancelled) return null;
    if (typeof createImageBitmap === 'function') {
      return createImageBitmap(blob).then((bitmap) => {
        paint(bitmap, bitmap.width, bitmap.height);
        bitmap.close?.();
        return null;
      });
    }
    return new Promise<null>((resolve) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        paint(image, image.naturalWidth, image.naturalHeight);
        URL.revokeObjectURL(url);
        resolve(null);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      image.src = url;
    });
  }).catch(() => {

    /* Le lettrage de repli reste en place : le décor ne doit jamais casser. */});
  return {
    texture,
    dispose: () => {
      cancelled = true;
      texture.dispose();
    }
  };
}
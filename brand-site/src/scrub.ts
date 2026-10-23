import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Hero bloom scroll-scrub: a frame sequence extracted from the
 * Seedance hero clip, drawn cover-fit onto a full-viewport canvas
 * and scrubbed by scroll position.
 *
 * Frames live in /media/hero/frame_0001.webp … frame_NNNN.webp
 * (regenerate with scripts/extract-frames — FRAME_COUNT must match).
 */
const FRAME_COUNT = 161;
const framePath = (i: number) =>
  `${import.meta.env.BASE_URL}media/hero/frame_${String(i + 1).padStart(4, '0')}.webp`;

// The opening (drop → burst) is where the clip moves fastest and jumps
// between frames, so it loads first and gets a larger share of the
// scroll; every step is a crossfade between neighbours, never a hard cut.
const OPENING_FRAMES = 30;
const OPENING_SCROLL = 0.25;
const BLEND_STEPS = 16;

const OPENING_SHARE = OPENING_FRAMES / (FRAME_COUNT - 1);
const scrollToFrames = (p: number) =>
  p < OPENING_SCROLL
    ? (p / OPENING_SCROLL) * OPENING_SHARE
    : OPENING_SHARE + ((p - OPENING_SCROLL) / (1 - OPENING_SCROLL)) * (1 - OPENING_SHARE);

export function initHeroScrub(reducedMotion: boolean): void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
  const state = { frame: 0 };
  let lastDrawn = -1;

  const resize = () => {
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h || (w === canvas.width && h === canvas.height)) return;
    canvas.width = w;
    canvas.height = h;
    lastDrawn = -1;
    draw();
  };

  const paint = (img: HTMLImageElement, alpha: number) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  };

  const draw = () => {
    const pos = Math.min(FRAME_COUNT - 1, Math.max(0, state.frame));
    const key = Math.round(pos * BLEND_STEPS);
    if (key === lastDrawn) return;

    const base = Math.floor(pos);
    const mix = pos - base;
    let from = frames[base];
    let to = mix > 0 ? frames[Math.min(FRAME_COUNT - 1, base + 1)] : null;
    if (!from || (mix > 0 && !to)) {
      // a neighbour is still loading: show the nearest loaded frame so
      // scrubbing never blanks, unblended until the pair arrives
      const index = Math.round(pos);
      from = frames[index];
      for (let d = 1; d < FRAME_COUNT && !from; d++) {
        from = frames[index - d] ?? frames[index + d] ?? null;
      }
      to = null;
    }
    if (!from) return;
    lastDrawn = key;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(from, 1);
    if (to) paint(to, mix);
  };

  const loadFrame = (i: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        frames[i] = img;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = framePath(i);
    });

  // layout may not have settled when this module runs — observe instead
  new ResizeObserver(resize).observe(canvas);
  resize();

  if (reducedMotion) {
    // static hero: show one developed frame, no scrub
    loadFrame(Math.round(FRAME_COUNT * 0.55)).then(() => {
      state.frame = Math.round(FRAME_COUNT * 0.55);
      draw();
    });
    return;
  }

  // the opening in order first (it is what the first scroll shows), then
  // the rest in coarse-to-fine passes so early scrubbing has something to
  // show across the whole range
  loadFrame(0).then(draw);
  const order: number[] = [];
  for (let i = 0; i < Math.min(OPENING_FRAMES, FRAME_COUNT); i++) order.push(i);
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < FRAME_COUNT; i += step) {
      if (!order.includes(i)) order.push(i);
    }
  }
  let cursor = 0;
  const pump = () => {
    if (cursor >= order.length) return;
    const batch = order.slice(cursor, cursor + 6);
    cursor += 6;
    Promise.all(batch.map(loadFrame)).then(() => {
      lastDrawn = -1;
      draw();
      pump();
    });
  };
  pump();

  gsap.to(state, {
    frame: FRAME_COUNT - 1,
    ease: scrollToFrames,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
    },
    onUpdate: draw,
  });

  // hero copy recedes as the bloom takes over the frame
  gsap.to('.hero__content', {
    opacity: 0,
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: '12% top',
      end: '45% top',
      scrub: true,
    },
  });
  gsap.to('.hero__scroll-hint', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '12% top',
      scrub: true,
    },
  });

  ScrollTrigger.refresh();
}

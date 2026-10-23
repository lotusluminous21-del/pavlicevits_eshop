import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Hero bloom scroll-scrub. The film is the Seedance master with its repeated
 * frames removed, RIFE in-betweens where it moves fastest (so every step
 * moves about as much as the next) and a Real-ESRGAN 4× upscale — see
 * scripts/hero-film.py. It ships as AVIF frames in four sizes and the page
 * loads the smallest that covers the screen:
 *
 *   media/hero/m|l|xl.pack   1920, 2560, 3840 wide (16:9)
 *   media/hero/p.pack        1296 × 2160 centre crop, portrait screens
 *   media/hero/s|ps.pack     768 × 432 / 432 × 720 proxies (~6 KB a frame)
 *
 * A pack is one file per set: an index, then the frames in load order (the
 * first READY_FRAMES, then coarse to fine), streamed so each frame is usable
 * as soon as its bytes arrive. Frames are decoded off the main thread
 * (createImageBitmap) into caches around the scroll position, sized by
 * memory. The frame under the playhead is always the one drawn: at full
 * size once decoded, from its proxy until then. A fast scroll only decodes
 * proxies (cheap to decode and upload) plus the full pair where it is; the
 * full-size frames ahead fill in as soon as the scroll slows.
 */
const FRAME_COUNT = 273;
// the drop → burst opening (frames 0–99) gets a larger share of the scroll
const OPENING_END = 99;
const OPENING_SCROLL = 0.3;
const BLEND_STEPS = 16;
// the film's top rows, where the drop enters, sit behind the solid header
const TOP_CROP = 0.085;

type Tier = { id: string; w: number; h: number };
const LANDSCAPE: Tier[] = [
  { id: 'm', w: 1920, h: 1080 },
  { id: 'l', w: 2560, h: 1440 },
  { id: 'xl', w: 3840, h: 2160 },
];
const PORTRAIT: Tier = { id: 'p', w: 1296, h: 2160 };
const PROXY: Tier = { id: 's', w: 768, h: 432 };
const PROXY_PORTRAIT: Tier = { id: 'ps', w: 432, h: 720 };
// canvas backing store cap (a 5K screen draws at 4K and lets the browser scale)
const MAX_CANVAS_PX = 3840 * 2160 * 1.1;
const FULL_DECODES = 2;
const PROXY_DECODES = 2;
const AHEAD = 10;
const PROXY_AHEAD = 24;
const PROXY_CAPACITY = 48;
// scrub speed (frames/s) above which full-size frames are decoded only
// under the playhead; normal reading-speed scrolling stays below it
const FAST = 40;
const SETTLE_MS = 140;
// below this speed the scroll is all but resting
const REST = 8;
// a device that drops this many of the last 30 frames while scrubbing at
// full size switches to proxies in motion (full size at rest) for the visit
const SLOW_FRAME_MS = 30;
const SLOW_FRAMES = 4;

const OPENING_SHARE = OPENING_END / (FRAME_COUNT - 1);
const scrollToFrames = (p: number) =>
  p < OPENING_SCROLL
    ? (p / OPENING_SCROLL) * OPENING_SHARE
    : OPENING_SHARE + ((p - OPENING_SCROLL) / (1 - OPENING_SCROLL)) * (1 - OPENING_SHARE);

// The intro waits on these: progress over the first frames, then "ready"
const READY_FRAMES = 12;
const announceProgress = (share: number) =>
  window.dispatchEvent(new CustomEvent('hero:progress', { detail: share }));
const announceReady = () => {
  if (document.documentElement.dataset.heroReady === '1') return;
  document.documentElement.dataset.heroReady = '1';
  window.dispatchEvent(new Event('hero:ready'));
};

const packPath = (tier: Tier) => `${import.meta.env.BASE_URL}media/hero/${tier.id}.pack`;

// Stream a pack: 'PVF1', uint32 count, count × (uint32 frame, uint32 bytes),
// then the payloads in that order (little endian). Calls onFrame as each
// payload completes; stops quietly once `live` turns false.
async function streamPack(
  url: string,
  priority: string,
  live: () => boolean,
  onFrame: (i: number, blob: Blob) => void,
): Promise<void> {
  const res = await fetch(url, { priority } as RequestInit);
  if (!res.ok || !res.body) throw new Error(`pack ${res.status}`);
  const reader = res.body.getReader();
  let head = new Uint8Array(0);
  let buf: Uint8Array<ArrayBuffer> | null = null;
  let filled = 0;
  const entries: [number, number][] = [];
  let k = 0;
  let offset = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (!live()) {
      reader.cancel();
      return;
    }
    if (value) {
      if (!buf) {
        const joined = new Uint8Array(head.length + value.length);
        joined.set(head);
        joined.set(value, head.length);
        head = joined;
        const view = new DataView(head.buffer);
        if (head.length >= 4 && view.getUint32(0, false) !== 0x50564631) throw new Error('not a pack'); // 'PVF1'
        const count = head.length >= 8 ? view.getUint32(4, true) : -1;
        if (count >= 0 && head.length >= 8 + count * 8) {
          let total = 8 + count * 8;
          for (let e = 0; e < count; e++) {
            const len = view.getUint32(12 + e * 8, true);
            entries.push([view.getUint32(8 + e * 8, true), len]);
            total += len;
          }
          buf = new Uint8Array(Math.max(total, head.length));
          buf.set(head);
          filled = head.length;
          offset = 8 + count * 8;
        }
      } else {
        const room = Math.min(value.length, buf.length - filled);
        buf.set(value.subarray(0, room), filled);
        filled += room;
      }
      while (buf && k < entries.length && offset + entries[k][1] <= filled) {
        onFrame(entries[k][0], new Blob([buf.subarray(offset, offset + entries[k][1])], { type: 'image/avif' }));
        offset += entries[k][1];
        k++;
      }
    }
    if (done) return;
  }
}

// smallest set that covers the area below the header with at most ~15 %
// upscaling; one size down on Save-Data or a 2G/3G connection
function pickTier(cw: number, ch: number, top: number): Tier {
  if (cw / ch < 0.8) return PORTRAIT;
  const need = Math.max((cw * 9) / 16, (ch - top) / (1 - TOP_CROP));
  let i = LANDSCAPE.findIndex((t) => t.h >= need * 0.85);
  if (i < 0) i = LANDSCAPE.length - 1;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '')) i = Math.max(0, i - 1);
  return LANDSCAPE[i];
}

type FrameSet = {
  tier: Tier;
  blobs: (Blob | null)[];
  bitmaps: Map<number, ImageBitmap>;
  decoding: Set<number>;
  capacity: number;
};

const frameSet = (tier: Tier, capacity: number): FrameSet => ({
  tier,
  blobs: new Array(FRAME_COUNT).fill(null),
  bitmaps: new Map(),
  decoding: new Set(),
  capacity,
});

const fullCapacity = (t: Tier) => {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  return Math.max(8, Math.floor(((memory >= 8 ? 480 : 240) * 2 ** 20) / (t.w * t.h * 4)));
};

export function initHeroScrub(reducedMotion: boolean): void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) {
    announceReady();
    return;
  }
  const header = document.getElementById('site-header');

  const state = { frame: 0 };
  let top = 0; // header height in canvas px
  let full: FrameSet | null = null;
  let proxy: FrameSet | null = null;
  let generation = 0;
  let lastKey = -1;
  let lastPos = 0;
  let lastT = 0;
  let dir = 1;
  let speed = 0; // frames per second, smoothed
  let settle = 0;
  let frameRequest = 0;
  let lastDrawT = 0;
  const gaps: number[] = [];
  let constrained = false;
  // full frames decode straight to the size they are drawn at (when that is
  // smaller), so drawing is 1:1: less to upload, nothing to rescale
  let decodeSize: ImageBitmapOptions | undefined;
  let fallback: HTMLImageElement | null = null;
  let fetched = 0;

  // ready once the first frames are in and the first one is decoded
  const maybeReady = () => {
    if (full?.bitmaps.has(0) && fetched >= READY_FRAMES) announceReady();
  };

  const paint = (img: CanvasImageSource & { width: number; height: number }, alpha: number) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const crop = img.height * TOP_CROP;
    const avail = ch - top;
    const scale = Math.max(cw / img.width, avail / (img.height - crop));
    const dw = img.width * scale;
    const dh = img.height * scale;
    // the cropped top lands on the header's lower edge; extra height is
    // trimmed evenly above and below the visible area
    const y = top - crop * scale - Math.max(0, ((img.height - crop) * scale - avail) / 2);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - dw) / 2, y, dw, dh);
    ctx.globalAlpha = 1;
  };

  const pair = (set: FrameSet | null, base: number, mix: number) => {
    const a = set?.bitmaps.get(base);
    const b = mix > 0 ? set?.bitmaps.get(Math.min(FRAME_COUNT - 1, base + 1)) : undefined;
    return a && (mix === 0 || b) ? ([a, b] as const) : null;
  };

  const nearest = (pos: number) => {
    let best: ImageBitmap | null = null;
    let bestD = Infinity;
    for (const set of [full, proxy]) {
      for (const [i, bmp] of set?.bitmaps ?? []) {
        const d = Math.abs(i - pos);
        if (d < bestD) {
          bestD = d;
          best = bmp;
        }
      }
    }
    return best;
  };

  const draw = () => {
    if (fallback) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paint(fallback, 1);
      return;
    }
    const now = performance.now();
    const pos = Math.min(FRAME_COUNT - 1, Math.max(0, state.frame));
    if (pos !== lastPos && lastDrawT && now - lastDrawT < 250 && !constrained) {
      gaps.push(now - lastDrawT);
      if (gaps.length > 30) gaps.shift();
      constrained = gaps.filter((g) => g > SLOW_FRAME_MS).length >= SLOW_FRAMES;
    }
    lastDrawT = now;
    if (pos !== lastPos) {
      const dt = Math.max(1, now - lastT);
      speed = speed * 0.6 + (Math.abs(pos - lastPos) / (dt / 1000)) * 0.4;
      dir = pos > lastPos ? 1 : -1;
      lastT = now;
      // once the scroll rests, decode the full-size frames around it
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        speed = 0;
        schedule();
      }, SETTLE_MS);
    }
    lastPos = pos;
    schedule();

    const key = Math.round(pos * BLEND_STEPS);
    if (key === lastKey) return;
    const base = Math.floor(pos);
    const mix = pos - base;
    const sharp = !constrained || speed < REST ? pair(full, base, mix) : null;
    const soft = sharp ? null : pair(proxy, base, mix);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const p = sharp ?? soft;
    if (p) {
      paint(p[0], 1);
      if (p[1]) paint(p[1], mix);
    } else {
      const near = nearest(pos);
      if (near) paint(near, 1);
    }
    // anything short of the full-size pair is redrawn when better frames land
    lastKey = sharp ? key : -1;
  };

  const request = (set: FrameSet | null, want: number[], max: number) => {
    if (!set) return;
    for (const i of want) {
      if (set.decoding.size >= max) break;
      if (i < 0 || i >= FRAME_COUNT || set.bitmaps.has(i) || set.decoding.has(i) || !set.blobs[i]) continue;
      decode(set, i);
    }
  };

  // decode around the playhead, nearest first, in the direction of travel
  const schedule = () => {
    const base = Math.floor(lastPos);
    const fullWant = constrained && speed >= REST ? [] : [base, base + 1];
    if (speed < (constrained ? REST : FAST) && full) {
      // never want more than the cache holds, or decodes evict each other
      const ahead = Math.min(AHEAD, full.capacity - 4);
      for (let d = 1; d <= ahead; d++) fullWant.push(base + 1 + d * dir);
      fullWant.push(base - dir, base - 2 * dir);
    }
    request(full, fullWant, FULL_DECODES);
    const proxyWant: number[] = [];
    for (let d = 0; d <= PROXY_AHEAD; d++) proxyWant.push(base + d * dir);
    for (let d = 1; d <= 4; d++) proxyWant.push(base - d * dir);
    request(proxy, proxyWant, PROXY_DECODES);
  };

  const decode = (set: FrameSet, i: number) => {
    const gen = generation;
    set.decoding.add(i);
    const blob = set.blobs[i] as Blob;
    (set === full && decodeSize ? createImageBitmap(blob, decodeSize) : createImageBitmap(blob)).then(
      (bmp) => {
        set.decoding.delete(i);
        // a superseded set, or a full frame the playhead has already left
        if (gen !== generation || (set === full && Math.abs(i - lastPos) > AHEAD + 2)) {
          bmp.close();
          schedule();
          return;
        }
        set.bitmaps.set(i, bmp);
        while (set.bitmaps.size > set.capacity) {
          let far = -1;
          let farD = -1;
          for (const j of set.bitmaps.keys()) {
            const d = Math.abs(j - lastPos);
            if (d > farD) {
              farD = d;
              far = j;
            }
          }
          set.bitmaps.get(far)?.close();
          set.bitmaps.delete(far);
        }
        maybeReady();
        // only a stand-in on screen needs repainting, once per frame at most
        if (lastKey === -1 && !frameRequest) {
          frameRequest = requestAnimationFrame(() => {
            frameRequest = 0;
            draw();
          });
        }
      },
      () => {
        set.decoding.delete(i);
        // no AVIF decoding here: show the poster still instead of the film
        if (set === full && i === 0 && gen === generation) showFallback();
      },
    );
  };

  const resizeDecodes = () => {
    if (!full) return;
    const { w: iw, h: ih } = full.tier;
    const scale = Math.max(canvas.width / iw, (canvas.height - top) / (ih * (1 - TOP_CROP)));
    const next: ImageBitmapOptions | undefined =
      scale < 0.95
        ? { resizeWidth: Math.round(iw * scale), resizeHeight: Math.round(ih * scale), resizeQuality: 'high' }
        : undefined;
    if (next?.resizeWidth === decodeSize?.resizeWidth) return;
    decodeSize = next;
    // decoded at the old size: re-decode around the playhead
    for (const bmp of full.bitmaps.values()) bmp.close();
    full.bitmaps.clear();
    lastKey = -1;
    schedule();
  };

  const showFallback = () => {
    const img = new Image();
    img.onload = () => {
      fallback = img;
      draw();
      announceReady();
    };
    img.onerror = announceReady;
    img.src = `${import.meta.env.BASE_URL}media/hero-poster.webp`;
  };

  // both packs stream side by side: the proxies (small) cover the whole film
  // within moments, the full set arrives first frames first, then coarse to fine
  const load = (t: Tier) => {
    generation++;
    const gen = generation;
    const live = () => gen === generation;
    for (const set of [full, proxy]) for (const bmp of set?.bitmaps.values() ?? []) bmp.close();
    const f = frameSet(t, fullCapacity(t));
    const pr = frameSet(t === PORTRAIT ? PROXY_PORTRAIT : PROXY, PROXY_CAPACITY);
    full = f;
    proxy = pr;
    lastKey = -1;
    fetched = 0;
    const arrive = (set: FrameSet) => (i: number, blob: Blob) => {
      set.blobs[i] = blob;
      if (set === f && i < READY_FRAMES) {
        fetched++;
        announceProgress(fetched / READY_FRAMES);
      }
      schedule();
      maybeReady();
    };
    streamPack(packPath(t), 'high', live, arrive(f)).catch(() => {
      // no film (network, or no AVIF): the poster still stands in
      if (live() && !f.bitmaps.size) showFallback();
    });
    streamPack(packPath(pr.tier), 'low', live, arrive(pr)).catch(() => undefined);
  };

  const resize = () => {
    let dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;
    if (cssW * cssH * dpr * dpr > MAX_CANVAS_PX) dpr = Math.sqrt(MAX_CANVAS_PX / (cssW * cssH));
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    top = Math.round((header?.offsetHeight ?? 0) * dpr);
    if (w !== canvas.width || h !== canvas.height) {
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    // a rotation between portrait and landscape swaps the frame set
    const t = pickTier(w, h, top);
    if (!reducedMotion && full && (t === PORTRAIT) !== (full.tier === PORTRAIT)) load(t);
    resizeDecodes();
    lastKey = -1;
    draw();
  };

  // layout may not have settled when this module runs — observe instead
  new ResizeObserver(resize).observe(canvas);
  resize();

  if (reducedMotion) {
    // static hero: the poster (a developed frame), no film to download
    showFallback();
    return;
  }

  load(pickTier(canvas.width, canvas.height, top));
  resizeDecodes();

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

  // the copy sinks and fades with the drop as the bloom takes over the frame
  // (the seal hands over to the header separately, see dock.ts)
  gsap.to('.hero__copy, .hero__meta', {
    opacity: 0,
    y: 36,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: '8% top',
      end: '36% top',
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

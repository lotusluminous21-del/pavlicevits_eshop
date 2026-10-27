import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createDecoder } from './decode';
import { createSurface, type Picture } from './render';

/**
 * Hero bloom scroll-scrub. The film is the Seedance master with its repeated
 * frames removed, RIFE in-betweens where it moves fastest (so every step
 * moves about as much as the next) and a Real-ESRGAN 4× upscale — see
 * scripts/hero-film.py. It ships as AVIF frames in four sizes:
 *
 *   media/hero/m|l|xl.pack   1920, 2560, 3840 wide (16:9)
 *   media/hero/p.pack        1296 × 2160 centre crop, portrait screens
 *   media/hero/s|ps.pack     768 × 432 / 432 × 720 proxies (~6 KB a frame)
 *
 * A pack is one file per set: an index, then the frames in load order (the
 * first READY_FRAMES, then coarse to fine), streamed so each frame is usable
 * as soon as its bytes arrive. Frames are decoded in workers (decode.ts) into
 * caches around the scroll position, sized by memory, and drawn with WebGL
 * (render.ts): each goes up to the GPU once, and a step is one blended quad.
 * The frame under the playhead is always the one drawn: at full size once
 * decoded, from its proxy until then. A fast scroll only decodes proxies
 * (cheap to decode and upload) plus the full pair where it is; the full-size
 * frames ahead fill in as soon as the scroll slows.
 *
 * Which full-size set is used is a quality ladder, set by what the device
 * shows it can do rather than by its screen or browser (a big screen on a
 * slow decoder is what stuttered). Every screen starts on its smallest set;
 * the first decodes are timed while the intro plays, and the largest set
 * the screen needs that decodes fast enough is loaded in its place before
 * the intro hands over. It keeps listening: a set that falls
 * behind, or dropped frames, step it down a rung (and it never climbs back
 * past that); headroom at rest steps it up. Below the bottom rung, proxies
 * stand in while moving. The canvas holds no more pixels than the set in
 * use, and the compositor scales it to the screen.
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
// full-size decodes in flight, one per worker (one on a two-core machine)
const FULL_DECODES = Math.max(1, Math.min(2, (navigator.hardwareConcurrency || 4) - 2));
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
// a device that drops this many of the last 30 frames while scrubbing steps
// down the ladder (from the bottom rung: proxies in motion, full size at rest)
const SLOW_FRAME_MS = 30;
const SLOW_FRAMES = 4;

// The ladder. A set fits when its frames decode fast enough, across the
// workers, to keep up with a brisk scrub (faster than that, proxies stand in
// until it slows anyway). Decode time grows with the pixels, so the smaller
// set's timings predict the larger ones; GPU uploads don't (mostly fixed
// cost), so the main thread is judged by its dropped frames instead. A pick
// leaves a margin; the set in use is only dropped once clearly over.
const KEEP_UP = 30;
const DECODE_BUDGET_MS = (FULL_DECODES * 1000) / KEEP_UP;
const UP_MARGIN = 0.75;
const DOWN_MARGIN = 1.3;
// warm decodes timed before the first pick, and on a new set before it is judged
const CALIBRATION = 3;
const REVIEW_AFTER = 6;
const SAMPLES = 9;
// a switch's own hitches (a new stream, its first uploads) aren't dropped frames
const QUIET_MS = 1500;
// main-thread time a frame may spend uploading decoded frames ahead of the playhead
const UPLOAD_SLICE_MS = 4;

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

// The full-size sets this screen can use, smallest first: up to the smallest
// that covers the area below the header with at most ~15 % upscaling (one
// size down on Save-Data or a 2G/3G connection), and only sizes the GPU takes
function ladderFor(cw: number, ch: number, top: number, maxSide: number): Tier[] {
  if (cw / ch < 0.8) return [PORTRAIT];
  const need = Math.max((cw * 9) / 16, (ch - top) / (1 - TOP_CROP));
  let i = LANDSCAPE.findIndex((t) => t.h >= need * 0.85);
  if (i < 0) i = LANDSCAPE.length - 1;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '')) i = Math.max(0, i - 1);
  const fit = LANDSCAPE.slice(0, i + 1).filter((t) => t.w <= maxSide);
  return fit.length ? fit : LANDSCAPE.slice(0, 1);
}

type FrameSet = {
  tier: Tier;
  blobs: (Blob | null)[];
  frames: Map<number, Picture>;
  decoding: Set<number>;
  capacity: number;
  // full frames decode straight to this size when it is smaller than the set's
  decodeTo?: ImageBitmapOptions;
  fetched: number;
  // false once nobody draws from it: its stream stops, late decodes are dropped
  live: boolean;
};

const frameSet = (tier: Tier, capacity: number): FrameSet => ({
  tier,
  blobs: new Array(FRAME_COUNT).fill(null),
  frames: new Map(),
  decoding: new Set(),
  capacity,
  fetched: 0,
  live: true,
});

const fullCapacity = (t: Tier) => {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  return Math.max(8, Math.floor(((memory >= 8 ? 480 : 240) * 2 ** 20) / (t.w * t.h * 4)));
};

const mp = (t: { w: number; h: number }) => (t.w * t.h) / 1e6;
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[xs.length >> 1] ?? 0;
const note = (xs: number[], v: number) => {
  xs.push(v);
  if (xs.length > SAMPLES) xs.shift();
};

export function initHeroScrub(reducedMotion: boolean): void {
  const host = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  const surface =
    host &&
    createSurface(host, {
      // the GPU let go of every frame: decode them again once it is back
      lost: () => {
        for (const set of [full, prev, proxy]) if (set) clearFrames(set);
        if (fallback) fallback.tex = null;
        lastKey = -1;
      },
      restored: () => {
        lastKey = -1;
        schedule();
        draw();
      },
    });
  if (!surface) {
    announceReady();
    return;
  }
  const canvas = surface.canvas;
  const header = document.getElementById('site-header');
  const decoders = reducedMotion ? null : { full: createDecoder(FULL_DECODES), proxy: createDecoder(1) };

  const state = { frame: 0 };
  let top = 0; // header height in canvas px
  let full: FrameSet | null = null;
  // the set in use before a switch, drawn until the new one has the frames
  let prev: FrameSet | null = null;
  // a larger set downloading behind the one in use, before a step up
  let next: FrameSet | null = null;
  let proxy: FrameSet | null = null;
  let lastKey = -1;
  let lastPos = 0;
  let lastT = 0;
  let dir = 1;
  let speed = 0; // frames per second, smoothed
  let settle = 0;
  let frameRequest = 0;
  let pumpRequest = 0;
  // the ticker frame that already sent a full-size frame to the GPU
  let sentOn = -1;
  let lastDrawT = 0;
  const gaps: number[] = [];
  let constrained = false;
  let fallback: Picture | null = null;
  let posterAsked = false;

  // the ladder: the sets this screen can use, the one in use, and the
  // highest allowed after a step down
  let ladder: Tier[] = LANDSCAPE.slice(0, 1);
  let rung = 0;
  let ceiling = Infinity;
  let calibrated = false;
  let switchedAt = 0;
  let sinceSwitch = 0;
  // recent warm full-size decodes, ms per megapixel
  const decodeCost: number[] = [];

  // ready once the first frames are in, the first one is decoded and the
  // set to keep is picked, so the intro hands over to it
  const maybeReady = () => {
    if (full?.frames.has(0) && full.fetched >= READY_FRAMES && (calibrated || ladder.length < 2)) announceReady();
  };

  // where a frame lands: covering the area below the header, its cropped top
  // on the header's lower edge, extra height trimmed evenly above and below
  const cover = (w: number, h: number) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const crop = h * TOP_CROP;
    const avail = ch - top;
    const scale = Math.max(cw / w, avail / (h - crop));
    return {
      x: (cw - w * scale) / 2,
      y: top - crop * scale - Math.max(0, ((h - crop) * scale - avail) / 2),
      w: w * scale,
      h: h * scale,
    };
  };

  const pair = (set: FrameSet | null, base: number, mix: number) => {
    if (!set) return null;
    const a = set.frames.get(base);
    const b = mix > 0 ? set.frames.get(Math.min(FRAME_COUNT - 1, base + 1)) : undefined;
    return a && (mix === 0 || b) ? { set, a, b: b ?? null } : null;
  };

  const nearest = (pos: number) => {
    let near: { set: FrameSet; a: Picture; b: null } | null = null;
    let nearD = Infinity;
    for (const set of [full, prev, proxy]) {
      if (!set) continue;
      for (const [i, pic] of set.frames) {
        const d = Math.abs(i - pos);
        if (d < nearD) {
          nearD = d;
          near = { set, a: pic, b: null };
        }
      }
    }
    return near;
  };

  const requestDraw = () => {
    if (frameRequest) return;
    frameRequest = requestAnimationFrame(() => {
      frameRequest = 0;
      draw();
    });
  };

  const draw = () => {
    if (fallback) {
      surface.draw(fallback, null, 0, cover(fallback.w, fallback.h));
      return;
    }
    const now = performance.now();
    const pos = Math.min(FRAME_COUNT - 1, Math.max(0, state.frame));
    // frame gaps between the draws that move the playhead (a repaint for a
    // decode that just landed mustn't hide a long frame)
    if (pos !== lastPos) {
      if (lastDrawT && now - lastDrawT < 250 && !constrained && now - switchedAt > QUIET_MS) {
        gaps.push(now - lastDrawT);
        if (gaps.length > 30) gaps.shift();
        if (gaps.filter((g) => g > SLOW_FRAME_MS).length >= SLOW_FRAMES) stepDown();
      }
      lastDrawT = now;
      const dt = Math.max(1, now - lastT);
      speed = speed * 0.6 + (Math.abs(pos - lastPos) / (dt / 1000)) * 0.4;
      dir = pos > lastPos ? 1 : -1;
      lastT = now;
      // once the scroll rests, decode the full-size frames around it (and
      // replace a stand-in left from moving fast)
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        speed = 0;
        schedule();
        if (lastKey === -1) requestDraw();
      }, SETTLE_MS);
    }
    lastPos = pos;
    schedule();

    const key = Math.round(pos * BLEND_STEPS);
    if (key === lastKey) return;
    const base = Math.floor(pos);
    const mix = pos - base;
    const sharpOk = !constrained || speed < REST;
    let sharp = sharpOk ? pair(full, base, mix) : null;
    // at speed, the full pair only counts once it is on the GPU: two 4K
    // uploads in one frame cost the frame (the pump sends one a frame)
    if (sharp && speed >= FAST && !(surface.uploaded(sharp.a) && (!sharp.b || surface.uploaded(sharp.b)))) {
      sharp = null;
    }
    const shown = sharp ?? (sharpOk ? pair(prev, base, mix) : null) ?? pair(proxy, base, mix) ?? nearest(pos);
    if (shown) {
      if (shown.set !== proxy && !(surface.uploaded(shown.a) && (!shown.b || surface.uploaded(shown.b)))) {
        sentOn = gsap.ticker.frame;
      }
      surface.draw(shown.a, shown.b, mix, cover(shown.a.w, shown.a.h));
    } else {
      surface.clear();
    }
    // anything short of the full-size pair is redrawn when better frames land
    lastKey = sharp ? key : -1;
    // the new set has taken over from the one before the switch
    if (sharp && prev) {
      release(prev);
      prev = null;
    }
  };

  // dropped frames: a rung down, and no higher from here on; from the bottom
  // rung, proxies in motion and full size at rest
  const stepDown = () => {
    gaps.length = 0;
    if (rung > 0) {
      ceiling = rung - 1;
      switchTo(rung - 1);
    } else {
      constrained = true;
    }
  };

  const request = (set: FrameSet | null, want: number[], max: number) => {
    if (!set) return;
    for (const i of want) {
      if (set.decoding.size >= max) break;
      if (i < 0 || i >= FRAME_COUNT || set.frames.has(i) || set.decoding.has(i) || !set.blobs[i]) continue;
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

  // decoded frames go up to the GPU ahead of the playhead, so reaching them
  // costs only the draw: a slice of each frame, and at most one full-size
  // frame per frame between this and the draw (a 4K upload is several ms)
  const pump = () => {
    pumpRequest = 0;
    const t0 = performance.now();
    const due: [number, Picture, boolean][] = [];
    for (const set of [full, proxy]) {
      if (!set) continue;
      for (const [i, pic] of set.frames) if (!surface.uploaded(pic)) due.push([i, pic, set === full]);
    }
    due.sort((a, b) => Math.abs(a[0] - lastPos) - Math.abs(b[0] - lastPos));
    for (const [, pic, large] of due) {
      if (performance.now() - t0 > UPLOAD_SLICE_MS || (large && sentOn === gsap.ticker.frame)) {
        queuePump();
        break;
      }
      surface.upload(pic);
      if (large) sentOn = gsap.ticker.frame;
    }
    // a stand-in on screen may now have its own frame on the GPU
    if (due.length && lastKey === -1) requestDraw();
  };

  const queuePump = () => {
    if (surface.gl && !pumpRequest) pumpRequest = requestAnimationFrame(pump);
  };

  const decode = (set: FrameSet, i: number) => {
    if (!decoders) return;
    set.decoding.add(i);
    const isFull = set === full;
    (isFull ? decoders.full : decoders.proxy)(set.blobs[i] as Blob, isFull ? set.decodeTo : undefined).then(
      ({ bmp, ms, cold }) => {
        set.decoding.delete(i);
        // a superseded set, or a full frame the playhead has already left
        if (!set.live || (set === full && Math.abs(i - lastPos) > AHEAD + 2)) {
          bmp.close();
          schedule();
          return;
        }
        set.frames.set(i, { w: bmp.width, h: bmp.height, src: bmp, tex: null });
        evict(set);
        maybeReady();
        queuePump();
        // only a stand-in on screen needs repainting, once per frame at most
        if (lastKey === -1) requestDraw();
        schedule();
        if (set === full && !cold) {
          note(decodeCost, ms / mp(set.tier));
          sinceSwitch++;
          review();
        }
      },
      () => {
        set.decoding.delete(i);
        // no AVIF decoding here: show the poster still instead of the film
        if (set === full && i === 0) showFallback();
      },
    );
  };

  // over capacity: drop the frames farthest from the playhead
  const evict = (set: FrameSet) => {
    while (set.frames.size > set.capacity) {
      let far = -1;
      let farD = -1;
      for (const j of set.frames.keys()) {
        const d = Math.abs(j - lastPos);
        if (d > farD) {
          farD = d;
          far = j;
        }
      }
      const pic = set.frames.get(far);
      if (pic) surface.release(pic);
      set.frames.delete(far);
    }
  };

  const fits = (t: Tier, margin: number) => median(decodeCost) * mp(t) <= DECODE_BUDGET_MS * margin;

  // the largest set that fits, up to what the screen needs and any step down
  const best = (margin: number) => {
    let r = 0;
    for (let k = 1; k < ladder.length && k <= ceiling; k++) if (fits(ladder[k], margin)) r = k;
    return r;
  };

  // after each warm full-size decode: pick, keep or change the set
  const review = () => {
    if (!calibrated) {
      if (decodeCost.length < CALIBRATION) return;
      calibrated = true;
      const r = best(UP_MARGIN);
      if (r !== rung) switchTo(r);
      else maybeReady();
      return;
    }
    if (sinceSwitch < REVIEW_AFTER) return;
    if (rung > 0 && !fits(ladder[rung], DOWN_MARGIN)) {
      let r = rung - 1;
      while (r > 0 && !fits(ladder[r], 1)) r--;
      ceiling = r;
      switchTo(r);
    } else if (speed < REST && rung < Math.min(ceiling, ladder.length - 1)) {
      const r = best(UP_MARGIN);
      if (r > rung) prepare(r);
    }
  };

  const switchTo = (r: number) => {
    rung = r;
    loadFull(ladder[r]);
    fit();
    requestDraw();
  };

  const clearFrames = (set: FrameSet) => {
    for (const pic of set.frames.values()) surface.release(pic);
    set.frames.clear();
  };

  const release = (set: FrameSet | null) => {
    if (!set) return;
    set.live = false;
    clearFrames(set);
  };

  const arrive = (set: FrameSet) => (i: number, blob: Blob) => {
    if (!set.live) return;
    set.blobs[i] = blob;
    if (i < READY_FRAMES) {
      set.fetched++;
      if (set === full) announceProgress(set.fetched / READY_FRAMES);
    }
    schedule();
    maybeReady();
  };

  const stream = (set: FrameSet, priority: string) =>
    streamPack(packPath(set.tier), priority, () => set.live, arrive(set));

  // draw from this set now; the one in use keeps a few frames around the
  // playhead on screen until the new one has its own there
  const useFull = (set: FrameSet) => {
    release(prev);
    prev = full;
    if (prev) {
      prev.live = false;
      prev.capacity = 4;
      evict(prev);
    }
    full = set;
    switchedAt = performance.now();
    sinceSwitch = 0;
    gaps.length = 0;
    lastKey = -1;
  };

  const cancelNext = () => {
    if (next) next.live = false;
    next = null;
  };

  // a switch that can't wait (the first pick, a step down, a new screen):
  // the new set streams first frames first while the old one stands in
  const loadFull = (t: Tier) => {
    cancelNext();
    const set = frameSet(t, fullCapacity(t));
    useFull(set);
    stream(set, 'high').catch(() => {
      // no film (network, or no AVIF): the poster still stands in
      if (set.live && !set.frames.size) showFallback();
    });
  };

  // a step up can wait: the larger set downloads behind the one in use and
  // takes over once it is all in, so no stretch of the film drops to
  // proxies while it streams
  const prepare = (r: number) => {
    if (next) return;
    const t = ladder[r];
    const set = frameSet(t, fullCapacity(t));
    next = set;
    stream(set, 'low').then(
      () => {
        if (next !== set) return;
        next = null;
        const k = ladder.indexOf(t);
        if (k <= rung || k > ceiling) {
          set.live = false;
          return;
        }
        rung = k;
        useFull(set);
        fit();
        requestDraw();
      },
      () => {
        if (next === set) next = null;
      },
    );
  };

  // the proxies (small) cover the whole film within moments, side by side
  // with the full set's first frames first, then coarse to fine
  const loadProxy = (t: Tier) => {
    release(proxy);
    const set = frameSet(t, PROXY_CAPACITY);
    proxy = set;
    stream(set, 'low').catch(() => undefined);
  };

  // the screen in device px (capped), which picks the ladder
  const measure = () => {
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return null;
    const headerH = header?.offsetHeight ?? 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (cssW * cssH * dpr * dpr > MAX_CANVAS_PX) dpr = Math.sqrt(MAX_CANVAS_PX / (cssW * cssH));
    return { cssW, cssH, headerH, dpr };
  };

  // the canvas holds no more pixels than the set in use (or the poster) has
  const fit = () => {
    const m = measure();
    if (!m) return;
    const src = fallback ?? full?.tier ?? ladder[rung];
    const k = Math.max(m.cssW / src.w, (m.cssH - m.headerH) / (src.h * (1 - TOP_CROP)));
    const dpr = Math.min(m.dpr, 1 / k);
    const w = Math.round(m.cssW * dpr);
    const h = Math.round(m.cssH * dpr);
    top = Math.round(m.headerH * dpr);
    if (w !== canvas.width || h !== canvas.height) {
      canvas.width = w;
      canvas.height = h;
    }
    resizeDecodes();
    lastKey = -1;
  };

  // full frames decode straight to the size they are drawn at (when that is
  // smaller, or the GPU takes no more), so drawing is 1:1
  const resizeDecodes = () => {
    if (!full) return;
    const { w: iw, h: ih } = full.tier;
    const scale = Math.min(
      Math.max(canvas.width / iw, (canvas.height - top) / (ih * (1 - TOP_CROP))),
      surface.maxSide / Math.max(iw, ih),
    );
    const next: ImageBitmapOptions | undefined =
      scale < 0.95
        ? { resizeWidth: Math.round(iw * scale), resizeHeight: Math.round(ih * scale), resizeQuality: 'high' }
        : undefined;
    if (next?.resizeWidth === full.decodeTo?.resizeWidth) return;
    full.decodeTo = next;
    // decoded at the old size: re-decode around the playhead
    clearFrames(full);
    lastKey = -1;
    schedule();
  };

  const resize = () => {
    const m = measure();
    if (!m) return;
    const next = ladderFor(m.cssW * m.dpr, m.cssH * m.dpr, m.headerH * m.dpr, surface.maxSide);
    const turned = (next[0] === PORTRAIT) !== (ladder[0] === PORTRAIT);
    ladder = next;
    if (full) {
      if (turned) {
        // a rotation between portrait and landscape swaps both sets
        loadProxy(ladder[0] === PORTRAIT ? PROXY_PORTRAIT : PROXY);
        rung = calibrated ? best(UP_MARGIN) : 0;
        loadFull(ladder[rung]);
      } else if (rung > ladder.length - 1) {
        // a smaller screen needs less (a larger one may afford more, which
        // the next decodes tell)
        rung = ladder.length - 1;
        loadFull(ladder[rung]);
      }
    }
    fit();
    draw();
  };

  const showFallback = () => {
    if (posterAsked) return;
    posterAsked = true;
    cancelNext();
    for (const set of [full, prev, proxy]) release(set);
    full = prev = proxy = null;
    const img = new Image();
    img.onload = () => {
      fallback = { w: img.naturalWidth, h: img.naturalHeight, src: img, tex: null };
      fit();
      draw();
      announceReady();
    };
    img.onerror = announceReady;
    img.src = `${import.meta.env.BASE_URL}media/hero-poster.webp`;
  };

  if (import.meta.env.DEV) {
    // debug handle for the quality ladder (dev tooling only)
    (window as unknown as Record<string, unknown>).__hero = () => ({
      gl: surface.gl,
      set: full?.tier.id,
      ladder: ladder.map((t) => t.id),
      rung,
      ceiling,
      constrained,
      canvas: [canvas.width, canvas.height],
      decodeMsPerMp: median(decodeCost),
      next: next?.tier.id,
      slowFrames: `${gaps.filter((g) => g > SLOW_FRAME_MS).length}/${gaps.length}`,
      cached: { full: full?.frames.size, prev: prev?.frames.size, proxy: proxy?.frames.size },
    });
  }

  // layout may not have settled when this module runs — observe instead
  new ResizeObserver(resize).observe(canvas);
  resize();

  if (reducedMotion) {
    // static hero: the poster (a developed frame), no film to download
    showFallback();
    return;
  }

  // the bottom rung first: its first decodes pick the set to keep
  loadProxy(ladder[0] === PORTRAIT ? PROXY_PORTRAIT : PROXY);
  loadFull(ladder[0]);
  fit();

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

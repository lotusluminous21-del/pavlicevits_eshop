import gsap from 'gsap';

/**
 * Entrance sequence. The overlay (#intro in index.html, styled inline in the
 * head so it paints before any script) draws the seal while the page loads:
 * the rings from 12 o'clock, the P filling upward, the ring text turning into
 * place, the drops settling. Then the seal moves to its place in the hero.
 *
 *   1. entrance — CSS, fixed 1.8 s from first paint
 *   2. gate     — the overlay holds until the entrance has played out (plus a
 *                 short hold) and the first screen is ready: fonts (Greek
 *                 glyphs of both families) and the first hero frames (the
 *                 seal is inline: nothing to fetch). Never shorter than
 *                 FULL.minMs from navigation, never longer than
 *                 FULL.capMs, so it can't hang on a slow link.
 *   3. handoff  — fixed 1.6 s timeline: the seal travels into the hero, the
 *                 canvas dissolves to the film, the copy rises in.
 *
 * Returning visits in the same session, #anchor links and reduced motion get
 * the QUICK path: a short hold and a fade. If this script never runs, the
 * head CSS removes the overlay on its own.
 */

type Scroller = { stop(): void; start(): void } | null;

const SEEN_KEY = 'pv-intro-seen';
const FULL = { minMs: 2200, capMs: 8000, holdMs: 350 };
const QUICK = { minMs: 400, capMs: 3000, holdMs: 0 };
const REVEAL = '.site-header > *, .hero__emblem, .hero__headline > span, .hero__ctas, .hero__eyebrow, .hero__sub, .hero__scroll-hint';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

function fontsReady(): Promise<void> {
  if (!document.fonts) return Promise.resolve();
  const sample = 'Το σωστό χρώμα. Για δουλειά που αντέχει. PAVLICEVITS';
  return Promise.all([
    document.fonts.load('780 16px "Inter Variable"', sample),
    document.fonts.load('italic 280 16px "Noto Serif Display Variable"', sample),
  ])
    .then(() => document.fonts.ready)
    .then(() => undefined)
    .catch(() => undefined);
}

function heroFramesReady(onShare: (share: number) => void): Promise<void> {
  return new Promise((resolve) => {
    if (document.documentElement.dataset.heroReady === '1') {
      onShare(1);
      resolve();
      return;
    }
    window.addEventListener('hero:progress', (e) => onShare((e as CustomEvent<number>).detail));
    window.addEventListener('hero:ready', () => { onShare(1); resolve(); }, { once: true });
  });
}

// The seal's own CSS animations: the entrance always plays out in full, even
// when the first paint came late (slow HTML, cold cache)
function entranceDone(intro: HTMLElement): Promise<void> {
  const mark = intro.querySelector('.intro__mark');
  const anims = mark && typeof mark.getAnimations === 'function' ? mark.getAnimations({ subtree: true }) : [];
  if (!anims.length) return Promise.resolve();
  return Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
}

function handoff(intro: HTMLElement, done: () => void): void {
  const mark = intro.querySelector<SVGSVGElement>('.intro__mark');
  const target = document.querySelector<SVGSVGElement>('.hero__emblem');
  intro.style.pointerEvents = 'none';
  const tl = gsap.timeline({ onComplete: done });

  tl.to('.intro__line', { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0);
  if (mark && target) {
    const a = mark.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    tl.to(mark, {
      x: b.left + b.width / 2 - (a.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top + a.height / 2),
      scale: b.height / a.height,
      duration: 1.1,
      ease: 'power3.inOut',
    }, 0.05)
      .set(target, { opacity: 1 }, 1.15)
      .set(mark, { opacity: 0 }, 1.15);
  }
  // the light comes up under the seal as it lands
  tl.fromTo('.hero__sign', { '--lit': 0 }, { '--lit': 1, duration: 1.1, ease: 'power2.out' }, 0.85);
  tl.to(intro, { backgroundColor: 'rgba(10, 14, 26, 0)', duration: 0.95, ease: 'power2.inOut' }, 0.3)
    .fromTo('.hero__canvas', { scale: 1.06 }, { scale: 1, duration: 1.3, ease: 'power2.out', clearProps: 'transform' }, 0.3)
    .fromTo('.hero__headline > span', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0.7)
    .fromTo('.hero__ctas', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.9)
    .to('.site-header > *, .hero__eyebrow, .hero__sub, .hero__scroll-hint', { opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.05 }, 0.9);
}

function fadeOut(intro: HTMLElement, done: () => void, reducedMotion: boolean): void {
  const d = reducedMotion ? 0.2 : 0.5;
  intro.style.pointerEvents = 'none';
  gsap.timeline({ onComplete: done })
    .to(intro, { opacity: 0, duration: d, ease: 'power1.out' }, 0)
    .to(REVEAL, { opacity: 1, duration: d, ease: 'power1.out' }, 0.05)
    .fromTo('.hero__sign', { '--lit': 0 }, { '--lit': 1, duration: d, ease: 'power1.out' }, 0.05);
}

export function runIntro(scroller: Scroller, reducedMotion: boolean): void {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  const finish = () => {
    intro?.remove();
    root.classList.remove('intro-on', 'intro-quick');
    scroller?.start();
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage unavailable */ }
  };
  if (!intro) {
    finish();
    return;
  }

  const quick = root.classList.contains('intro-quick') || reducedMotion || window.scrollY > 80;
  if (quick) root.classList.add('intro-quick');
  scroller?.stop();

  const line = intro.querySelector<HTMLElement>('.intro__line i');
  let fonts = 0, frames = 0;
  const paint = () => line?.style.setProperty('--p', (0.35 * fonts + 0.65 * frames).toFixed(3));

  const assets = Promise.all([
    fontsReady().then(() => { fonts = 1; paint(); }),
    heroFramesReady((share) => { frames = Math.max(frames, share); paint(); }),
  ]);

  // gate: entrance finished (+ a short hold) and assets in, or the cap.
  // performance.now() counts from navigation start.
  const { minMs, capMs, holdMs } = quick ? QUICK : FULL;
  const entrance = quick ? Promise.resolve() : entranceDone(intro).then(() => wait(holdMs));
  Promise.race([Promise.all([assets, entrance]), wait(capMs - performance.now())])
    .then(() => wait(minMs - performance.now()))
    .then(() => (quick ? fadeOut(intro, finish, reducedMotion) : handoff(intro, finish)));
}

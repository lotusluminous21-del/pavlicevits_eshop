import type Lenis from 'lenis';
import { framesToScroll, scrollToFrames, setHeroPlaying } from './scrub';

/**
 * An in-page link followed from inside the hero, before the film has played
 * through (the hero's "see the work" / "how would you like it" and the
 * header's "talk to us"), plays the film first and then travels on. One
 * continuous motion in two parts:
 *
 *   1. the film, from where it stands to its end, linear: the same number
 *      of frames every second from the first (the opening, packed tighter
 *      into the scroll, gets its full time too);
 *   2. the rest of the way, quickly: it starts at the speed the film left
 *      off, gathers pace and eases to a stop on the target.
 *
 * Any wheel, touch or key scroll takes over at once (Lenis drops the
 * animation). Links from below the hero, or to above it, scroll as before.
 */
const FILM_S = 2; // the whole film, top of the hero to its end
// the rest of the way: by distance, within these bounds
const TRAVEL_S = { min: 1, max: 1.8, base: 0.8, pxPerS: 6000 };

const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v));

let journeys = 0;

/** Plays the film on the way to `target`; false when the link should scroll as before. */
export function playThroughHero(lenis: Lenis, target: HTMLElement): boolean {
  const hero = document.getElementById('hero');
  // (stopped: the intro is still on)
  if (!hero || lenis.isStopped) return false;
  const y0 = lenis.animatedScroll;
  // the scroll the film runs over: hero top at the top ('top top') to hero
  // bottom at the bottom ('bottom bottom'), as in scrub.ts
  const heroStart = hero.getBoundingClientRect().top + y0;
  const heroEnd = heroStart + hero.offsetHeight - window.innerHeight;
  const yT = clamp(0, target.getBoundingClientRect().top + y0, lenis.limit);
  if (heroEnd <= heroStart || y0 >= heroEnd - 1 || yT <= heroEnd) return false;

  // 1. the film: its share still to play, at FILM_S for the whole of it
  const p0 = clamp(0, (y0 - heroStart) / (heroEnd - heroStart), 1);
  const f0 = scrollToFrames(p0);
  const t1 = Math.max(0.3, FILM_S * (1 - f0));
  const filmY = (t: number) => {
    const p = framesToScroll(f0 + ((1 - f0) * t) / t1);
    return y0 + ((heroEnd - y0) * (p - p0)) / (1 - p0 || 1);
  };
  // the speed the film leaves off at, px/s
  const v0 = (filmY(t1) - filmY(t1 - 0.001)) / 0.001;

  // 2. the rest: a cubic from v0 to rest (monotonic while v0 · t2 ≤ 3 · d2)
  const d2 = yT - heroEnd;
  let t2 = clamp(TRAVEL_S.min, TRAVEL_S.base + d2 / TRAVEL_S.pxPerS, TRAVEL_S.max);
  if (v0 * t2 > 3 * d2) t2 = (3 * d2) / v0;
  const travelY = (t: number) => {
    const u = (t - t1) / t2;
    return heroEnd + (u * u * u - 2 * u * u + u) * t2 * v0 + (3 * u * u - 2 * u * u * u) * d2;
  };

  const total = t1 + t2;
  const at = (x: number) => {
    const t = x * total;
    return ((t < t1 ? filmY(t) : travelY(t)) - y0) / (yT - y0);
  };

  const id = ++journeys;
  setHeroPlaying(true);
  let over = false;
  const done = () => {
    if (over) return;
    over = true;
    off();
    setHeroPlaying(false);
  };
  // another scroll replaces this one (a wheel, or another link), or a touch
  // or a key stops it and the page scrolls natively
  const off = lenis.on('scroll', () => {
    if (lenis.userData?.journey !== id || lenis.isScrolling !== 'smooth') done();
  });
  lenis.scrollTo(yT, { duration: total, easing: at, userData: { journey: id }, onComplete: done });
  return true;
}

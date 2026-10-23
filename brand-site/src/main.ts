import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroScrub } from './scrub';
import { runIntro } from './intro';
import { initDock } from './dock';
import { initScenes } from './scenes';
import { initLeadForm } from './form';

document.documentElement.classList.add('js');

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
  });
  const smooth = lenis;
  smooth.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => smooth.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (import.meta.env.DEV) {
    // debug handle for pausing the motion loop (dev tooling only)
    (window as unknown as Record<string, unknown>).__motion = { gsap, lenis };
  }

  // anchor links route through Lenis so smooth scroll stays consistent
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href') ?? '');
      if (target) {
        e.preventDefault();
        smooth.scrollTo(target as HTMLElement, { offset: 0 });
      }
    });
  });
}

// the intro listens for the hero's loading events, so it starts first
runIntro(lenis, reducedMotion);
initHeroScrub(reducedMotion);
if (!reducedMotion) initDock();
initScenes(reducedMotion);
initLeadForm();

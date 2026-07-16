import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroScrub } from './scrub';
import { initScenes } from './scenes';
import { initLeadForm } from './form';

document.documentElement.classList.add('js');

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
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
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
      }
    });
  });
}

// header state
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

initHeroScrub(reducedMotion);
initScenes(reducedMotion);
initLeadForm();

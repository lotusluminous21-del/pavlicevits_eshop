import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Pinned media scenes (clips 2/3/4), section reveals and the
 * counter strip. Pinning itself is CSS sticky; GSAP drives the
 * text reveals against scroll position.
 */
export function initScenes(reducedMotion: boolean): void {
  initSceneVideos();
  if (reducedMotion) {
    // content is fully visible by default; only the count-up is skipped
    document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
      el.textContent = `${el.dataset.countTo}${el.dataset.suffix ?? ''}`;
    });
    return;
  }
  initSceneReveals();
  initSectionReveals();
  initCounters();
}

/* lazy-load the ambient clips and only play them while on screen */
function initSceneVideos(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>('.media-scene__video');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (!video.src && video.dataset.src) {
            // data-src is root-relative; honor Vite's base when deployed under a subpath
            video.src = import.meta.env.BASE_URL + video.dataset.src.replace(/^\//, '');
            video.load();
          }
          video.play().catch(() => {
            /* autoplay can be blocked; the poster stays visible */
          });
        } else if (video.src) {
          video.pause();
        }
      }
    },
    { rootMargin: '25% 0px' },
  );
  videos.forEach((v) => io.observe(v));
}

/* text pinned over each clip: reveal in, hold, ease out — scrubbed */
function initSceneReveals(): void {
  document.querySelectorAll<HTMLElement>('.media-scene').forEach((scene) => {
    const content = scene.querySelector('.media-scene__content');
    if (!content) return;
    const pieces = content.children;

    gsap.set(pieces, { opacity: 0, y: 44 });
    gsap
      .timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      })
      .to(pieces, { opacity: 1, y: 0, stagger: 0.12, duration: 0.3, ease: 'power2.out' }, 0.08)
      .to({}, { duration: 0.42 }) // hold while pinned
      .to(pieces, { opacity: 0, y: -30, duration: 0.2, ease: 'power1.in' });
  });
}

/* one-shot rises for static sections */
function initSectionReveals(): void {
  const targets = document.querySelectorAll(
    [
      '.identity__line',
      '.categories__head',
      '.cat-card',
      '.counters__item',
      '.contact__head',
      '.lead-form',
      '.shop-details',
      '.site-footer__slogan',
    ].join(','),
  );
  targets.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });
}

/* tabular numerals counting up when the strip enters */
function initCounters(): void {
  document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
    const to = Number(el.dataset.countTo);
    const suffix = el.dataset.suffix ?? '';
    const state = { value: 0 };
    el.textContent = `0${suffix}`;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          value: to,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.round(state.value)}${suffix}`;
          },
        });
      },
    });
  });
}

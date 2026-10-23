import gsap from 'gsap';

/**
 * The signature docks. At the top of the page the hero mark is the only
 * mark on screen and the header carries just the wordmark; over the first
 * stretch of the hero scroll the mark travels into the header's mark slot,
 * the wordmark makes room for it, and the two marks hand over at the end.
 *
 * Positions are measured with transforms cleared and relative to the hero
 * stage, which is sticky at the top of the viewport for this whole range,
 * so a refresh at any scroll position gives the same path.
 */
export function initDock(): void {
  const sign = document.querySelector<HTMLElement>('.hero__sign');
  const stage = document.querySelector<HTMLElement>('.hero__stage');
  const slot = document.querySelector<HTMLElement>('.site-header__mark');
  const word = document.querySelector<HTMLElement>('.site-header__word');
  if (!sign || !stage || !slot || !word) return;

  const untransformed = (el: HTMLElement) => {
    const prev = el.style.transform;
    el.style.transform = 'none';
    const r = el.getBoundingClientRect();
    el.style.transform = prev;
    return r;
  };
  const path = () => {
    const a = untransformed(sign);
    const s = stage.getBoundingClientRect();
    const b = slot.getBoundingClientRect();
    return {
      x: b.left + b.width / 2 - (a.left - s.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top - s.top + a.height / 2),
      scale: b.height / a.height,
    };
  };
  // how far the wordmark sits right of the mark slot
  const room = () => untransformed(word).left - slot.getBoundingClientRect().left;

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: '4% top',
      end: '26% top',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })
    .to(sign, { '--halo': 0, duration: 0.35, ease: 'none' }, 0)
    .to(sign, { x: () => path().x, y: () => path().y, scale: () => path().scale, duration: 1, ease: 'power2.inOut' }, 0)
    .fromTo(word, { x: () => -room() }, { x: 0, duration: 0.55, ease: 'power2.inOut' }, 0.45)
    .fromTo(slot, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, 0.88)
    .to(sign, { opacity: 0, duration: 0.12, ease: 'none' }, 0.88);
}

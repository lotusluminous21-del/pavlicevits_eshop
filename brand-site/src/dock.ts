import gsap from 'gsap';

/**
 * The signature hands over to the header, moving with the film rather than
 * across it. At the top of the page the seal is the only mark on screen and
 * the header carries just the wordmark. As the hero scroll begins and the
 * drop falls, the seal sinks after it: it drifts down, eases smaller and
 * fades, its light going out first. Once it is gone the header's roundel
 * (the seal's small form) drops into its slot from just above while its ring
 * draws, and the wordmark makes room. Every motion runs downward, with the
 * drop, never up across it.
 */
export function initDock(): void {
  const sign = document.querySelector<HTMLElement>('.hero__sign');
  const slot = document.querySelector<SVGSVGElement>('.site-header__mark');
  const ring = slot?.querySelector<SVGCircleElement>('.roundel__ring');
  const word = document.querySelector<HTMLElement>('.site-header__word');
  if (!sign || !slot || !ring || !word) return;

  const untransformed = <T,>(el: HTMLElement, read: () => T): T => {
    const prev = el.style.transform;
    el.style.transform = 'none';
    const r = read();
    el.style.transform = prev;
    return r;
  };
  // how far the wordmark sits right of the roundel's slot
  const room = () => untransformed(word, () => word.getBoundingClientRect().left) - slot.getBoundingClientRect().left;

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: '3% top',
      end: '24% top',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })
    .to(sign, { '--halo': 0, duration: 0.3, ease: 'none' }, 0)
    .to(sign, { y: () => sign.offsetHeight * 0.3, scale: 0.86, duration: 0.6, ease: 'power1.in' }, 0)
    .to(sign, { opacity: 0, duration: 0.42, ease: 'power1.in' }, 0.1)
    .fromTo(word, { x: () => -room() }, { x: 0, duration: 0.42, ease: 'power2.inOut' }, 0.5)
    .fromTo(slot, { y: () => -slot.getBoundingClientRect().height * 0.6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }, 0.62)
    .fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.38, ease: 'power2.inOut' }, 0.62);
}

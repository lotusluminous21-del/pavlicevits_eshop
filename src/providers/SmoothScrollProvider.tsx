'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Resets the scroll position to the top of the document on every route
 * change. Lives as a child of `<ReactLenis>` so `useLenis()` resolves
 * the active instance via context.
 *
 * Why this is needed: Lenis intercepts `window.scrollTo` and maintains
 * its own scroll state. The App Router's default scroll-to-top on Link
 * navigation gets swallowed by that interception, so the new page lands
 * wherever the previous one was scrolled to. We drive the reset through
 * Lenis itself with `immediate: true` so the new page snaps to top
 * without an animation that would feel like a slow page-load.
 *
 * Skipped scenarios:
 *   - First mount — the user might be deep-linking or refreshing, and
 *     yanking to 0 would clobber their position.
 *   - Hash navigation — `/foo#section` should land on the section, not
 *     at the top. We let Lenis/the browser handle the anchor scroll.
 */
function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current === null) {
      previous.current = pathname ?? '';
      return;
    }
    if (previous.current === pathname) return;
    previous.current = pathname ?? '';

    if (typeof window !== 'undefined' && window.location.hash) return;

    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Disable Lenis smooth scroll in the admin and expert UI as it conflicts with
  // nested scroll containers and interactive components.
  const isDisabledPath = pathname?.startsWith('/admin') || pathname?.startsWith('/expert');

  if (isDisabledPath) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}

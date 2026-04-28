import type { ReactNode } from "react";
import { SiteHeader } from "@/components/brand/SiteHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { KineticPostEffects } from "@/components/effects/KineticPostEffects";

/**
 * Brand layout. The scroll-driven motion blur lives here, NOT around the
 * sticky header — wrapping the header would smear it during scrolls. The
 * filter only applies to flow content inside <main>, so the header and
 * footer stay crisp.
 *
 * `maxBlur={16}` is a deliberate bump above the legacy default of 8px so
 * the effect is felt during fast wheel/touchpad flicks without the type
 * smearing unreadably. The filter auto-disables on mobile (where
 * touch-driven Lenis velocities would be jittery) and on routes with
 * inner scroll containers (admin, expert, categories).
 *
 * Each monad now renders through PaintGLCanvas (WebGL2 fragment
 * shader) inside MonadFrame. The previous SVG-filter pipeline
 * (PaintShimmer + PaintShimmerDefs) is no longer mounted; the shader
 * pipeline is faster on the GPU and the visual quality is higher.
 * PaintShimmer.tsx remains in the tree as dead code in case we ever
 * need to revert, but it's not imported here so it tree-shakes out.
 */
export default function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <KineticPostEffects maxBlur={16} velocityCeiling={55} className="w-full">
          {children}
        </KineticPostEffects>
      </main>
      <SiteFooter />
    </div>
  );
}

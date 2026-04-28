import { Arrival } from "@/components/brand/movements/Arrival";
import { Proposition } from "@/components/brand/movements/Proposition";
import { Breadth } from "@/components/brand/movements/Breadth";
import { Proof } from "@/components/brand/movements/Proof";
import { Invitation } from "@/components/brand/movements/Invitation";

/**
 * Desktop homepage — V3 monad collage.
 *
 * Five movements on one continuous black canvas, each anchored by one
 * or more fully-framed paint monads. Negative space between monads is
 * deliberate; content sits inside it without ever overlapping paint
 * pixels. See `scripts/COMPOSITION_PLAN_V3.md` for the per-monad spec
 * and `.claude/plans/wave-horizon-and-vortex-orbital-abstract-stallman.md`
 * for the schematic.
 */
export default function BrandHomePage() {
  return (
    <>
      <Arrival />
      <Proposition />
      <Breadth />
      <Proof />
      <Invitation />
    </>
  );
}

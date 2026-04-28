/**
 * 3D-rendered close-up surface samples used as the visual proof
 * for each Specialist Category. Photography-as-material — Mode B
 * "Sample portrait" per 02_VISUAL_DIRECTION.md §4.1.
 *
 * Each finish maps to one performance category. The image is the
 * material; the label is the destination.
 */
export const finishAssets = {
  decorative: {
    src: "/brand/finishes/finish-metal-smooth.webp",
    finish: "Smooth",
  },
  marine: {
    src: "/brand/finishes/finish-marine-gloss.webp",
    finish: "High-gloss",
  },
  industrial: {
    src: "/brand/finishes/finish-industrial-rugged.webp",
    finish: "Rugged",
  },
  wood: {
    src: "/brand/finishes/finish-wood-richly.webp",
    finish: "Richly finished",
  },
  metal: {
    src: "/brand/finishes/finish-decorative-satin.webp",
    finish: "Satin",
  },
  specialty: {
    src: "/brand/finishes/finish-specialty-iridescent.webp",
    finish: "Iridescent",
  },
} as const;

export type FinishKey = keyof typeof finishAssets;

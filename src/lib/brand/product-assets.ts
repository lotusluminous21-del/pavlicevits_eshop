/**
 * 3D-rendered product/material icons used in the MaterialSystem showcase.
 * Source images have transparent backgrounds and a consistent studio-render
 * aesthetic, ordered roughly by how the products are used on a real job:
 * preparation → priming → body coats → topcoats → tools → maintenance.
 */
export const productAssets = {
  putty: "/brand/products/putty.webp",
  primer: "/brand/products/primer.webp",
  paintBucket: "/brand/products/paint-bucket.webp",
  varnish: "/brand/products/varnish.webp",
  hardener: "/brand/products/hardener.webp",
  thinner: "/brand/products/thinner.webp",
  brushes: "/brand/products/brushes.webp",
  accessories: "/brand/products/accessories.webp",
  cleaningSpray: "/brand/products/cleaning-spray.webp",
} as const;

export type ProductAsset = keyof typeof productAssets;

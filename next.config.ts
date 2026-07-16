import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Allow ?v=<hash> cache-busting on monad PNGs (written by
    // scripts/generate-paint-assets-fal.py via the version manifest at
    // src/lib/brand/monad-versions.json). Omitting `search` allows any
    // query string; default behaviour without localPatterns rejects it.
    localPatterns: [
      {
        pathname: "/brand/paint/**",
      },
      {
        pathname: "/brand/**",
        search: "",
      },
    ],
  },
  async rewrites() {
    return [
      // Standalone brand one-pager, built from brand-site/ into public/brand-site/
      {
        source: "/brand-site",
        destination: "/brand-site/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

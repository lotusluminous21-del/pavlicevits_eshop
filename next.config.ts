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
  async redirects() {
    return [
      // The brand one-pager is the main page now; keep the old preview URL working
      {
        source: "/brand-site",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles so the static brand page shadows the app router's home page
      beforeFiles: [
        {
          source: "/",
          destination: "/brand-site/index.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
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

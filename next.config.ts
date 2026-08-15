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
      // Old-brand content pages consolidated into the one-pager. Their
      // (brand)/(legacy) route sources are unreachable behind these.
      { source: "/contact", destination: "/#epikoinonia", permanent: true },
      { source: "/services", destination: "/#katigories", permanent: true },
      { source: "/projects", destination: "/#ergo", permanent: true },
      { source: "/projects/:slug", destination: "/#ergo", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/partnerships", destination: "/", permanent: true },
      { source: "/faq", destination: "/", permanent: true },
      { source: "/insights", destination: "/", permanent: true },
      { source: "/insights/:slug", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles so the static brand pages shadow the app router's routes
      beforeFiles: [
        { source: "/", destination: "/brand-site/index.html" },
        { source: "/privacy", destination: "/brand-site/privacy.html" },
        { source: "/terms", destination: "/brand-site/terms.html" },
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

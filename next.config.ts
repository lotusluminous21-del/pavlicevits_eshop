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
        // Unlisted client reviews (e.g. the logo presenter): static folders
        // under public/review/<slug>/, reachable only by their link
        { source: "/review/:slug", destination: "/review/:slug/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // E-shop routes stay functional but out of search/AI indexes until the
    // client green-lights the shop (then remove the noindex + restore the
    // sitemap entries). Kept crawlable on purpose: robots.txt-blocking them
    // would hide the noindex and leave stale results in the index.
    const eshopRoutes = [
      "/search",
      "/search/:path*",
      "/products/:path*",
      "/cart",
      "/categories",
      "/expert",
      "/solution",
      "/login",
      "/profile",
    ];
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
      ...eshopRoutes.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      })),
      // Brand one-pager: the bundle's file names are content-hashed; the
      // media (hero film packs ≈ 8–14 MB, clips) keep their names, so they
      // revalidate daily and may be served stale meanwhile, CDN included.
      {
        source: "/brand-site/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand-site/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // Client review pages are never indexed, followed, cached or previewed.
      // They stay out of robots.txt and the sitemap on purpose: listing them
      // there would publish the links.
      {
        source: "/review/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

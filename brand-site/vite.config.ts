import { defineConfig } from 'vite';

// Absolute origin baked into canonical/OG/JSON-LD URLs in index.html
// (%VITE_SITE_URL% placeholders). Overridable via env / .env for local
// experiments; switch the default to https://pavlicevits.gr once the
// custom domain is connected, then rebuild with `npm run build:staging`.
process.env.VITE_SITE_URL ??=
  'https://pavlicevits-eshop--pavlicevits-9a889.europe-west4.hosted.app';

export default defineConfig({});

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Absolute origin baked into canonical/OG/JSON-LD URLs in the HTML pages
// (%VITE_SITE_URL% placeholders). Overridable via env for experiments.
process.env.VITE_SITE_URL ??= 'https://pavlicevits.gr';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./privacy.html', import.meta.url)),
        terms: fileURLToPath(new URL('./terms.html', import.meta.url)),
      },
    },
  },
});

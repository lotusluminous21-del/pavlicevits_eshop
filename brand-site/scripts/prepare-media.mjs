#!/usr/bin/env node
/**
 * Media pipeline for the brand site. Requires ffmpeg on PATH.
 *
 *   node scripts/prepare-media.mjs hero <input.mp4>
 *     → public/media/hero/frame_0001.webp … (scrub sequence, 20 fps)
 *       + public/media/hero-poster.webp
 *       Prints the frame count — keep FRAME_COUNT in src/scrub.ts in sync.
 *
 *   node scripts/prepare-media.mjs clip <input.mp4> <name>
 *     → public/media/<name>.mp4 (compressed, muted, faststart)
 *       + public/media/<name>-poster.webp
 *     Names used by index.html: material, project, shop.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const [mode, input, name] = process.argv.slice(2);
const mediaDir = join(import.meta.dirname, '..', 'public', 'media');

const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

if (mode === 'hero' && input) {
  const heroDir = join(mediaDir, 'hero');
  rmSync(heroDir, { recursive: true, force: true });
  mkdirSync(heroDir, { recursive: true });
  ff(['-i', input, '-vf', 'fps=20,scale=1280:-2', '-c:v', 'libwebp', '-quality', '68', '-f', 'image2', join(heroDir, 'frame_%04d.webp')]);
  ff(['-i', input, '-frames:v', '1', '-vf', 'scale=1280:-2', '-quality', '70', join(mediaDir, 'hero-poster.webp')]);
  const count = readdirSync(heroDir).filter((f) => f.endsWith('.webp')).length;
  console.log(`hero frames: ${count} — FRAME_COUNT in src/scrub.ts must equal this`);
} else if (mode === 'clip' && input && name) {
  mkdirSync(mediaDir, { recursive: true });
  ff(['-i', input, '-an', '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(mediaDir, `${name}.mp4`)]);
  ff(['-i', input, '-frames:v', '1', '-vf', 'scale=1280:-2', '-quality', '70', join(mediaDir, `${name}-poster.webp`)]);
  console.log(`wrote ${name}.mp4 + ${name}-poster.webp`);
} else {
  console.log('usage: prepare-media.mjs hero <input.mp4> | clip <input.mp4> <material|project|shop>');
  process.exit(1);
}

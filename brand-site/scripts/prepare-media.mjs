#!/usr/bin/env node
/**
 * Media pipeline for the brand site. Requires ffmpeg on PATH.
 *
 *   The hero scrub sequence has its own pipeline (dedupe, RIFE in-betweens,
 *   Real-ESRGAN, AVIF sets): python scripts/hero-film.py — see its header.
 *
 *   node scripts/prepare-media.mjs clip <input.mp4> <name>
 *     → public/media/<name>.mp4 (compressed, muted, faststart)
 *       + public/media/<name>-poster.webp
 *     Names used by index.html: material, project, shop.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [mode, input, name] = process.argv.slice(2);
const mediaDir = join(import.meta.dirname, '..', 'public', 'media');

const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

if (mode === 'clip' && input && name) {
  mkdirSync(mediaDir, { recursive: true });
  ff(['-i', input, '-an', '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(mediaDir, `${name}.mp4`)]);
  ff(['-i', input, '-frames:v', '1', '-vf', 'scale=1280:-2', '-quality', '70', join(mediaDir, `${name}-poster.webp`)]);
  console.log(`wrote ${name}.mp4 + ${name}-poster.webp`);
} else {
  console.log('usage: prepare-media.mjs clip <input.mp4> <material|project|shop>  (hero: scripts/hero-film.py)');
  process.exit(1);
}

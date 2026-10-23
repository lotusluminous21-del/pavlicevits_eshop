#!/usr/bin/env node
/**
 * Renders the jobs in <dir>/jobs.json to PNGs in <dir> with headless Chrome,
 * for scripts/brand-marks.py (icons, the logo raster, the share image).
 * Each job: { out, w, h, bg: css colour | 'transparent', html } — the html
 * resolves images relative to <dir>. No dependencies (Node ≥ 22 WebSocket).
 *
 *   node scripts/rasterize.mjs <dir>     CHROME=<path> to override the browser
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = resolve(process.argv[2]);
const jobs = JSON.parse(readFileSync(join(dir, 'jobs.json'), 'utf8'));
const chromePath = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = mkdtempSync(join(tmpdir(), 'raster-'));
const port = 9200 + Math.floor(Math.random() * 500);
const chrome = spawn(chromePath, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 150 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!target) throw new Error('Chrome did not start');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Runtime.enable');
for (const job of jobs) {
  const page = join(dir, `.job.html`);
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:${job.bg === 'transparent' ? 'transparent' : job.bg}}</style></head><body>${job.html}</body></html>`);
  await send('Emulation.setDeviceMetricsOverride', { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setDefaultBackgroundColorOverride', job.bg === 'transparent' ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
  await send('Page.navigate', { url: pathToFileURL(page).href });
  // wait for every image to load and decode
  for (let i = 0; i < 100; i++) {
    const r = await send('Runtime.evaluate', { awaitPromise: true, returnByValue: true,
      expression: 'Promise.all([...document.images].map((im) => im.decode().then(() => 1, () => 0))).then((a) => document.readyState === "complete" && a.every(Boolean))' });
    if (r?.result?.value) break;
    await sleep(100);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: job.w, height: job.h, scale: 1 } });
  writeFileSync(join(dir, job.out), Buffer.from(shot.data, 'base64'));
}
rmSync(join(dir, '.job.html'), { force: true });
ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
console.log(`rendered ${jobs.length} rasters`);

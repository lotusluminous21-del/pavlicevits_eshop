#!/usr/bin/env python3
"""
Hero film pipeline: Seedance master → scroll-scrub frame sets.

    python scripts/hero-film.py <master.mp4> --rife <dir> --esrgan <dir> --work <dir> [--from STAGE]

Stages (each writes into --work, so a run can resume with --from):

  extract   every frame of the master as PNG                       work/src/
  analyse   optical flow + pixel difference per frame transition    work/motion.json
  sequence  drop repeated frames (the master repeats every other
            frame in the opening and two frames a second after),
            then give each remaining step round(flow / REF) - 1
            RIFE in-betweens so every delivered step moves ≈ REF px  work/seq/, work/seq.json
  upscale   Real-ESRGAN x4plus on every frame (GPU)                 work/up/
  encode    AVIF frames per set                                     work/avif/{m,l,xl,p,s,ps}/
  pack      one streamable file per set + the poster                media/hero/<set>.pack

A pack is the set's frames in load order (the first READY frames, then
coarse to fine) behind an index, so the page fetches a set with one
request and can use each frame as soon as its bytes arrive:

    'PVF1' · uint32 count · count × (uint32 frame, uint32 bytes) · AVIF payloads
    (little endian, payloads in index order)

Needs ffmpeg on PATH, numpy + opencv-python-headless, and the ncnn-vulkan
builds of RIFE (nihui/rife-ncnn-vulkan, rife-v4.6 model) and Real-ESRGAN
(xinntao/Real-ESRGAN, realesrgan-x4plus). --gpu picks the Vulkan device
(the discrete GPU is usually 1 on laptops with an integrated one).

Prints FRAME_COUNT and OPENING_END; keep src/scrub.ts in sync.
"""
import argparse
import json
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np

STAGES = ['extract', 'analyse', 'sequence', 'upscale', 'encode', 'pack']
REF = 3.5          # target motion per delivered step, 720p px (p99.5 of the flow)
MAX_INSERT = 8     # in-betweens per source step at most
REPEAT_FLOW = 1.0  # p99.5 flow below this (and a tiny pixel difference) = repeated frame
REPEAT_DIFF = 0.6
OPENING_S = 30 / 24  # the drop → burst opening, in master seconds
# AVIF quality per set: proxies are only ever seen in motion; the portrait
# set is a touch lighter for mobile data (visually identical on a phone)
CRF = {'xl': 24, 'l': 24, 'm': 24, 'p': 27, 's': 36, 'ps': 36}
TIERS = {'m': (1920, 1080), 'l': (2560, 1440), 'xl': (3840, 2160)}
PORTRAIT = (1296, 2160)  # centre crop of the 3840 × 2160 frame
# proxies drawn while a fast scroll outruns full-size decoding
PROXY, PROXY_PORTRAIT = (768, 432), (432, 720)
SETS = ['xl', 'p', 'l', 'm', 's', 'ps']
READY = 12  # frames the intro waits on (READY_FRAMES in src/scrub.ts)

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'public' / 'media'


def ff(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *map(str, args)], check=True)


def extract(master, work):
    out = work / 'src'
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    ff('-i', master, '-vsync', '0', out / '%04d.png')


def analyse(work):
    frames = sorted((work / 'src').glob('*.png'))
    prev_g = prev_c = None
    steps = []
    for f in frames:
        c = cv2.imread(str(f))
        g = cv2.resize(cv2.cvtColor(c, cv2.COLOR_BGR2GRAY), (640, 360), interpolation=cv2.INTER_AREA)
        if prev_g is not None:
            flow = cv2.calcOpticalFlowFarneback(prev_g, g, None, 0.5, 4, 21, 4, 7, 1.5, 0)
            mag = np.linalg.norm(flow, axis=2) * (c.shape[0] / 360)
            steps.append({
                'flow': float(np.percentile(mag, 99.5)),
                'diff': float(np.abs(c.astype(np.float32) - prev_c).mean()),
            })
        prev_g, prev_c = g, c.astype(np.float32)
    (work / 'motion.json').write_text(json.dumps(steps))


def sequence(work, rife, gpu, fps):
    src = sorted((work / 'src').glob('*.png'))
    steps = json.loads((work / 'motion.json').read_text())
    out = work / 'seq'
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)

    plan = [(src[0], 0.0)]  # (frame path | (a, b, t), master time)
    last = 0
    for k, s in enumerate(steps):  # transition src[k] -> src[k + 1]
        nxt = k + 1
        if s['flow'] < REPEAT_FLOW and s['diff'] < REPEAT_DIFF:
            continue
        n = max(0, min(MAX_INSERT, round(s['flow'] / REF) - 1))
        ta, tb = last / fps, nxt / fps
        for j in range(1, n + 1):
            plan.append(((src[last], src[nxt], j / (n + 1)), ta + (tb - ta) * j / (n + 1)))
        plan.append((src[nxt], tb))
        last = nxt

    for i, (item, _) in enumerate(plan):
        dst = out / f'{i + 1:04d}.png'
        if isinstance(item, tuple):
            a, b, t = item
            subprocess.run([str(rife / 'rife-ncnn-vulkan.exe'), '-0', str(a), '-1', str(b), '-o', str(dst),
                            # rife parses the step with the system locale; el-GR uses a decimal comma
                            '-s', f'{t:.6f}'.replace('.', ','),
                            '-m', str(rife / 'rife-v4.6'), '-g', str(gpu)],
                           check=True, capture_output=True)
        else:
            shutil.copyfile(item, dst)
    opening_end = next(i for i, (_, ts) in enumerate(plan) if ts >= OPENING_S)
    (work / 'seq.json').write_text(json.dumps({'count': len(plan), 'openingEnd': opening_end,
                                                'times': [round(ts, 4) for _, ts in plan]}))


def upscale(work, esrgan, gpu):
    out = work / 'up'
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    subprocess.run([str(esrgan / 'realesrgan-ncnn-vulkan.exe'), '-i', str(work / 'seq'), '-o', str(out),
                    '-n', 'realesrgan-x4plus', '-g', str(gpu), '-f', 'png', '-j', '2:2:2'],
                   check=True, capture_output=True)


# sRGB frames → full-range 10-bit 4:2:0 AVIF, colour signalled explicitly so
# browsers convert back exactly
AVIF = ['-c:v', 'libaom-av1', '-still-picture', '1', '-cpu-used', '4', '-row-mt', '1',
        '-tiles', '2x2', '-color_range', 'pc', '-colorspace', 'smpte170m', '-color_primaries', 'bt709',
        '-color_trc', 'iec61966-2-1']
TO_YUV = 'out_color_matrix=bt601:out_range=full,format=yuv420p10le'


def encode_frame(path, out, sets=SETS):
    w, h = PORTRAIT
    graph = (
        '[0]scale=3840:2160:flags=lanczos,split=3[x][pc][d];'
        f'[x]split=2[x1][x2];[x1]scale={TO_YUV}[xl];'
        f'[x2]scale={PROXY[0]}:{PROXY[1]}:flags=lanczos:{TO_YUV}[s];'
        f'[pc]crop={w}:{h}:{(3840 - w) // 2}:0,split=2[p1][p2];[p1]scale={TO_YUV}[p];'
        f'[p2]scale={PROXY_PORTRAIT[0]}:{PROXY_PORTRAIT[1]}:flags=lanczos:{TO_YUV}[ps];'
        f'[d]split=2[d1][d2];'
        f'[d1]scale=2560:1440:flags=lanczos:{TO_YUV}[l];'
        f'[d2]scale=1920:1080:flags=lanczos:{TO_YUV}[m]'
    )
    args = ['-i', path, '-filter_complex', graph]
    for tier in SETS:
        if tier in sets:
            args += ['-map', f'[{tier}]', *AVIF, '-crf', str(CRF[tier]), out / tier / f'{path.stem}.avif']
        else:
            args += ['-map', f'[{tier}]', '-f', 'null', '-']
    ff(*args)


def encode(work):
    out = work / 'avif'
    shutil.rmtree(out, ignore_errors=True)
    for tier in SETS:
        (out / tier).mkdir(parents=True)
    frames = sorted((work / 'up').glob('*.png'))
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(lambda f: encode_frame(f, out), frames))


def load_order(count):
    order = list(range(min(READY, count)))
    seen = set(order)
    for step in (16, 8, 4, 2, 1):
        for i in range(0, count, step):
            if i not in seen:
                seen.add(i)
                order.append(i)
    return order


def pack(work):
    hero = MEDIA / 'hero'
    shutil.rmtree(hero, ignore_errors=True)
    hero.mkdir(parents=True)
    for tier in SETS:
        frames = sorted((work / 'avif' / tier).glob('*.avif'))
        order = load_order(len(frames))
        blobs = [frames[i].read_bytes() for i in order]
        head = b'PVF1' + len(order).to_bytes(4, 'little')
        head += b''.join(i.to_bytes(4, 'little') + len(b).to_bytes(4, 'little') for i, b in zip(order, blobs))
        (hero / f'{tier}.pack').write_bytes(head + b''.join(blobs))
    # still for browsers without AVIF and for reduced motion: a developed frame
    up = sorted((work / 'up').glob('*.png'))
    ff('-i', up[round(len(up) * 0.55)], '-vf', 'scale=2560:-2:flags=lanczos', '-quality', '80',
       MEDIA / 'hero-poster.webp')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('master', type=Path)
    ap.add_argument('--work', type=Path, required=True)
    ap.add_argument('--rife', type=Path)
    ap.add_argument('--esrgan', type=Path)
    ap.add_argument('--gpu', type=int, default=1)
    ap.add_argument('--fps', type=float, default=24)
    ap.add_argument('--from', dest='start', choices=STAGES, default='extract')
    a = ap.parse_args()
    a.work.mkdir(parents=True, exist_ok=True)
    run = STAGES[STAGES.index(a.start):]
    if 'extract' in run:
        extract(a.master, a.work)
    if 'analyse' in run:
        analyse(a.work)
    if 'sequence' in run:
        sequence(a.work, a.rife, a.gpu, a.fps)
    if 'upscale' in run:
        upscale(a.work, a.esrgan, a.gpu)
    if 'encode' in run:
        encode(a.work)
    if 'pack' in run:
        pack(a.work)
    seq = json.loads((a.work / 'seq.json').read_text())
    print(f"FRAME_COUNT = {seq['count']}; OPENING_END = {seq['openingEnd']}  (src/scrub.ts)")


if __name__ == '__main__':
    main()

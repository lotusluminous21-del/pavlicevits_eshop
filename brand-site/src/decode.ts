import DecodeWorker from './decode-worker?worker';

/**
 * Frame decoding off the page's main thread. Each worker decodes one frame
 * at a time with createImageBitmap and hands the bitmap back without a copy.
 * Safari decodes on whichever thread asks, so asking from a worker is what
 * keeps its scrolling free; elsewhere it costs nothing. One job per worker
 * also keeps the timings the quality ladder reads (scrub.ts) honest: a
 * worker's first decode, which pays for starting the decoder, is marked
 * cold. If the workers can't start or can't decode, frames decode on the
 * page as before.
 */
export type Decoded = { bmp: ImageBitmap; ms: number; cold: boolean };
export type Decode = (blob: Blob, opts?: ImageBitmapOptions) => Promise<Decoded>;

type Job = { blob: Blob; opts?: ImageBitmapOptions; resolve: (d: Decoded) => void; reject: (e: unknown) => void };
type Slot = { worker: Worker; job: Job | null; cold: boolean };

const onPage: Decode = (blob, opts) => {
  const t0 = performance.now();
  return (opts ? createImageBitmap(blob, opts) : createImageBitmap(blob)).then((bmp) => ({
    bmp,
    ms: performance.now() - t0,
    cold: false,
  }));
};

// once a worker fails where the page succeeds, every decoder stays on the page
let broken = false;

export function createDecoder(size: number): Decode {
  const slots: Slot[] = [];
  const queue: Job[] = [];

  const runOnPage = (job: Job) => onPage(job.blob, job.opts).then(job.resolve, job.reject);

  const run = () => {
    if (broken) {
      for (const job of queue.splice(0)) runOnPage(job);
      return;
    }
    for (const slot of slots) {
      if (slot.job || !queue.length) continue;
      const job = queue.shift() as Job;
      slot.job = job;
      slot.worker.postMessage({ blob: job.blob, opts: job.opts });
    }
  };

  for (let k = 0; k < size; k++) {
    let worker: Worker;
    try {
      worker = new DecodeWorker();
    } catch {
      broken = true;
      break;
    }
    const slot: Slot = { worker, job: null, cold: true };
    worker.onmessage = (e: MessageEvent<{ bmp: ImageBitmap | null; ms: number }>) => {
      const job = slot.job;
      slot.job = null;
      if (job) {
        const { bmp, ms } = e.data;
        if (bmp) {
          job.resolve({ bmp, ms, cold: slot.cold });
          slot.cold = false;
        } else {
          // a frame the page can decode but the worker can't: stay on the page
          onPage(job.blob, job.opts).then((d) => {
            broken = true;
            job.resolve(d);
          }, job.reject);
        }
      }
      run();
    };
    worker.onerror = () => {
      broken = true;
      const job = slot.job;
      slot.job = null;
      if (job) runOnPage(job);
      run();
    };
    slots.push(slot);
  }

  return (blob, opts) => {
    if (broken || !slots.length) return onPage(blob, opts);
    return new Promise<Decoded>((resolve, reject) => {
      queue.push({ blob, opts, resolve, reject });
      run();
    });
  };
}

// One frame at a time: decode the AVIF bytes to a bitmap and hand it back
// without a copy. Timed here, so the page's own work doesn't skew the reading.
type Job = { blob: Blob; opts?: ImageBitmapOptions };
const scope = self as unknown as {
  onmessage: ((e: MessageEvent<Job>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

// Where it can, the frame is drawn once into an OffscreenCanvas and handed
// back from there. In Chrome that bitmap already lives on the GPU, so the
// page's WebGL upload is a copy on the GPU instead of a main-thread stall
// pushing the pixels across (a 4K frame: 10–30 ms down to ~0). Anywhere this
// isn't available, or fails, the decoded bitmap goes back as it is.
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
const lift = (bmp: ImageBitmap): ImageBitmap => {
  if (typeof OffscreenCanvas === 'undefined') return bmp;
  try {
    if (!canvas || canvas.width !== bmp.width || canvas.height !== bmp.height) {
      canvas = new OffscreenCanvas(bmp.width, bmp.height);
      ctx = canvas.getContext('2d', { alpha: false });
    }
    if (!ctx) return bmp;
    ctx.drawImage(bmp, 0, 0);
    const out = canvas.transferToImageBitmap();
    bmp.close();
    return out;
  } catch {
    return bmp;
  }
};

scope.onmessage = async ({ data: { blob, opts } }) => {
  const t0 = performance.now();
  try {
    const bmp = lift(await (opts ? createImageBitmap(blob, opts) : createImageBitmap(blob)));
    scope.postMessage({ bmp, ms: performance.now() - t0 }, [bmp]);
  } catch {
    scope.postMessage({ bmp: null, ms: 0 });
  }
};

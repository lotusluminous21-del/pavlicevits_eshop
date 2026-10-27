/**
 * The hero film's drawing surface. With WebGL each decoded frame goes up to
 * the GPU once, and a frame step is one quad that blends the pair in a
 * shader. Its cost doesn't grow with the screen, and it doesn't depend on
 * how the browser rasterises a 2D canvas (Safari's is far heavier than
 * Chrome's at 4K). Without WebGL, or where it would run in software, the 2D
 * canvas draws the pair as before.
 */
export type Picture = {
  w: number;
  h: number;
  // the decoded pixels until they are on the GPU (an image is kept, so the
  // poster survives a lost context; a bitmap is closed once uploaded)
  src: ImageBitmap | HTMLImageElement | null;
  tex: WebGLTexture | null;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type Surface = {
  canvas: HTMLCanvasElement;
  gl: boolean;
  // largest texture side the GPU takes
  maxSide: number;
  uploaded(p: Picture): boolean;
  upload(p: Picture): void;
  release(p: Picture): void;
  clear(): void;
  // a, blended with b by mix, into r (canvas px)
  draw(a: Picture, b: Picture | null, mix: number, r: Rect): void;
};

export type SurfaceEvents = { lost(): void; restored(): void };

const VERT = `
attribute vec2 a_unit;
uniform vec4 u_rect;
varying vec2 v_uv;
void main() {
  v_uv = a_unit;
  gl_Position = vec4(mix(u_rect.xy, u_rect.zw, a_unit), 0.0, 1.0);
}`;

// highp where there is one: mediump can't address every texel of a 4K frame
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_a;
uniform sampler2D u_b;
uniform float u_mix;
varying vec2 v_uv;
void main() {
  gl_FragColor = mix(texture2D(u_a, v_uv), texture2D(u_b, v_uv), u_mix);
}`;

export function createSurface(canvas: HTMLCanvasElement, events: SurfaceEvents): Surface | null {
  return webgl(canvas, events) ?? canvas2d(canvas);
}

function webgl(canvas: HTMLCanvasElement, events: SurfaceEvents): Surface | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    // a software-rendered context draws slower than the 2D canvas would
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;

  let rectAt: WebGLUniformLocation | null = null;
  let mixAt: WebGLUniformLocation | null = null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };

  // program, quad and sampler units; again after a lost context comes back
  const setup = () => {
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const unit = gl.getAttribLocation(prog, 'a_unit');
    gl.enableVertexAttribArray(unit);
    gl.vertexAttribPointer(unit, 2, gl.FLOAT, false, 0, 0);
    rectAt = gl.getUniformLocation(prog, 'u_rect');
    mixAt = gl.getUniformLocation(prog, 'u_mix');
    gl.uniform1i(gl.getUniformLocation(prog, 'u_a'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_b'), 1);
    gl.clearColor(0, 0, 0, 0);
    return true;
  };

  if (!setup()) {
    // this canvas is spoken for: a fresh one takes its place for the 2D surface
    const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(fresh);
    return canvas2d(fresh);
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    events.lost();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    if (setup()) events.restored();
  });

  const upload = (p: Picture) => {
    if (p.tex || !p.src || gl.isContextLost()) return;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, p.src);
    p.tex = tex;
    if (p.src instanceof ImageBitmap) {
      p.src.close();
      p.src = null;
    }
  };

  return {
    canvas,
    gl: true,
    maxSide: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    uploaded: (p) => !!p.tex || !p.src || gl.isContextLost(),
    upload,
    release: (p) => {
      if (p.tex) gl.deleteTexture(p.tex);
      if (p.src instanceof ImageBitmap) p.src.close();
      p.tex = null;
      p.src = null;
    },
    clear: () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    draw: (a, b, mix, r) => {
      if (gl.isContextLost()) return;
      upload(a);
      if (b) upload(b);
      const cw = canvas.width;
      const ch = canvas.height;
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!a.tex) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, b?.tex ?? a.tex);
      // the frame's top-left at the quad's (0, 0): rows go up top first
      gl.uniform4f(rectAt, (r.x / cw) * 2 - 1, 1 - (r.y / ch) * 2, ((r.x + r.w) / cw) * 2 - 1, 1 - ((r.y + r.h) / ch) * 2);
      gl.uniform1f(mixAt, b?.tex ? mix : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

function canvas2d(canvas: HTMLCanvasElement): Surface | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  return {
    canvas,
    gl: false,
    maxSide: Infinity,
    uploaded: () => true,
    upload: () => undefined,
    release: (p) => {
      if (p.src instanceof ImageBitmap) p.src.close();
      p.src = null;
    },
    clear,
    draw: (a, b, mix, r) => {
      clear();
      // resizing the canvas resets these
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (a.src) ctx.drawImage(a.src, r.x, r.y, r.w, r.h);
      if (b?.src) {
        ctx.globalAlpha = mix;
        ctx.drawImage(b.src, r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
    },
  };
}

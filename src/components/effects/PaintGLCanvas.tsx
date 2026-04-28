'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface PaintGLCanvasProps {
  /** Image URL — typically a webp from the paint asset registry. */
  src: string;
  /** Intrinsic source width in px. Used to set the wrapper's aspect ratio. */
  width: number;
  /** Intrinsic source height in px. */
  height: number;
  /** Whether this is the LCP image — sets fetchpriority="high" on the <img>. */
  priority?: boolean;
  /** Tailwind/class names applied to the outer wrapper. */
  className?: string;
}

/**
 * Vertex shader. Renders a full-screen quad in clip space and exposes
 * `vUv` as the fragment's [0,1] texture coordinate. Y is flipped so
 * vUv (0,0) is the texture's TOP-LEFT corner — matches HTML <img>
 * orientation, since by default WebGL has Y up.
 */
const VERT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 1.0 - (aPos.y * 0.5 + 0.5));
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * Fragment shader. Two passes layered into one shader:
 *   1. Inigo Quilez recursive domain warping (2 iterations of 3-octave
 *      simplex fBm) — the "viscous wet paint" warp. This is what
 *      SVG `feTurbulence + feDisplacementMap` was approximating; doing
 *      it here gives true Perlin-derived noise + recursive warping
 *      which is impossible in SVG filters (no looping).
 *   2. Per-pixel Blinn-Phong specular against a luminance-derived
 *      bump map, with a slowly rotating light. Simulates a wet film
 *      catching the changing angle of the viewer.
 *
 * Uniforms:
 *   uTexture     — the painted monad
 *   uTime        — seconds since shader started rendering
 *   uResolution  — canvas pixel size (used to compute 1-px offsets for
 *                  the luminance gradient)
 */
const FRAG_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

// 2D Simplex noise — Stefan Gustavson, public domain.
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 2-octave fBm. Three octaves added high-frequency detail that
// compounded with the warp into visible jaggedness; two is plenty
// for a slow paint drift.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 2; i++) {
    v += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  // Time scale: 0.10 is the band where the eye catches the motion
  // within a glance without the noise field reading as "agitated".
  // Calmer values (0.06) make the effect easy to miss; faster ones
  // (0.18+) start to look nervous.
  float t = uTime * 0.10;

  // ── Single-pass smooth fBm warp ──
  // We deliberately do NOT use Inigo Quilez recursive domain warping
  // (the fbm(uv + 4*q) recipe) here. That recipe is canonically how
  // marble patterns are generated and at any visible warp magnitude
  // it shatters the painted structure into abstract marble. We want
  // the paint to still read as the painted gesture, just gently
  // breathing. A single fBm pass gives smoothly varying coherent
  // flow regions.
  vec2 q = vec2(
    fbm(uv * 1.5 + vec2(t, 0.0)),
    fbm(uv * 1.5 + vec2(5.2, 1.3) + vec2(0.0, t))
  );

  // Warp magnitude in UV space. 0.0075 ≈ 11 px peak on a 1500-px monad.
  // Clearly tracks if you look at the paint for a moment, but well
  // below the threshold (~0.015+ with this fbm scale) where coherent
  // flow regions break down into marble. This is the dominant
  // calibration knob — adjust here first.
  vec2 warp = q * 0.0075;

  vec2 paintUv = uv + warp;
  vec4 paint = texture(uTexture, paintUv);

  // ── Per-pixel specular wet-glaze ──
  // Forward differences of luminance derive a cheap surface normal
  // (one fewer texture sample than a Sobel kernel). The 2.5 bump
  // factor is gentle enough that highlights only fire where the paint
  // has genuine luminance gradients (edges of strokes, droplet rims).
  vec2 px = 1.0 / uResolution;
  vec3 c00 = paint.rgb;
  vec3 c10 = texture(uTexture, paintUv + vec2(px.x, 0.0)).rgb;
  vec3 c01 = texture(uTexture, paintUv + vec2(0.0, px.y)).rgb;
  float lum00 = dot(c00, vec3(0.299, 0.587, 0.114));
  float lum10 = dot(c10, vec3(0.299, 0.587, 0.114));
  float lum01 = dot(c01, vec3(0.299, 0.587, 0.114));

  vec3 normal = normalize(vec3(
    (lum00 - lum10) * 3.5,
    (lum00 - lum01) * 3.5,
    1.0
  ));

  // Light slowly rotates. xy=0.6 with z=0.8 puts it at roughly 37°
  // elevation — grazing enough that highlights only fire on slopes
  // facing toward the light, not on every bright pixel. Spec exponent
  // 30 is broad enough that the highlight is felt as a moving sheen
  // rather than a tight pinpoint. Light rotation rate (t * 0.6) is
  // 1.5× faster than the calm baseline so the highlights visibly
  // crawl across the paint over a few seconds of looking.
  float lightAngle = t * 0.6 + 0.6;
  vec3 lightDir = normalize(vec3(
    cos(lightAngle) * 0.6,
    sin(lightAngle) * 0.6,
    0.8
  ));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 30.0);

  // Glaze multiplier 0.7. Painted monads have specular highlights
  // baked in; this layers a more clearly moving wet film on top
  // without blasting (v1's 1.8 was). Gated by both source brightness
  // and alpha so it never lights up dark folds or spills onto the
  // transparent canvas.
  vec3 finalRgb = paint.rgb + spec * lum00 * 0.7 * paint.a;
  outColor = vec4(finalRgb, paint.a);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.error('PaintGLCanvas shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function compileProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.error('PaintGLCanvas program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Renders a paint monad through a WebGL2 fragment shader. The
 * underlying `<img>` element is also rendered behind the canvas so
 * that:
 *
 *   - It serves as the LCP image (rendered immediately, not waiting
 *     for shader compile + texture upload).
 *   - It's the texture source for the WebGL pass — we upload directly
 *     from the loaded HTMLImageElement, no second network fetch.
 *   - It's the fallback if WebGL2 isn't available, the user prefers
 *     reduced motion, or this is a mobile viewport.
 *
 * The canvas fades over the img once the first shader frame has
 * rendered. If the canvas never gets ready (compile fails, texture
 * upload fails, etc.), the img stays visible — the page never
 * regresses to broken state.
 */
export function PaintGLCanvas({
  src,
  width,
  height,
  priority = false,
  className,
}: PaintGLCanvasProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const disabled = reducedMotion || isMobile;

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    // No WebGL2 → no fancy effect, the <img> behind us covers the
    // visual; just don't try.
    if (!gl) return;

    const program = compileProgram(gl);
    if (!program) return;

    // ── Geometry: 2-triangle full-screen quad in clip space ──
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // ── Texture (uploaded once the <img> has decoded) ──
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let textureUploaded = false;
    const tryUploadTexture = () => {
      if (textureUploaded) return;
      if (!img.complete || !img.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // We do NOT flip Y on upload because the vertex shader already
      // flipped vUv. Premultiply alpha matches the canvas context's
      // premultipliedAlpha:true so the transparent edges of the paint
      // composite correctly.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      try {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );
        textureUploaded = true;
        // NOTE: ready is NOT set here — see render() below. We wait
        // until AFTER the first drawArrays so the cross-fade only
        // starts when the canvas actually has pixels on it. Setting
        // ready at upload time creates a brief window where the
        // canvas is fading in with nothing drawn yet, which renders
        // as the page background showing through (= white flash on
        // light mode).
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('PaintGLCanvas texImage2D failed:', err);
      }
    };

    if (img.complete) tryUploadTexture();
    const onImgLoad = () => tryUploadTexture();
    img.addEventListener('load', onImgLoad);

    // ── Resize handler ──
    // Run before each frame so DPR and CSS-driven resize are picked up
    // without a separate listener. The compare-and-skip avoids
    // gl.viewport calls in the steady state.
    //
    // DPR is capped at 1.5 (not the device's native 2 or 3) — the
    // shader produces broad smooth noise patterns where the difference
    // between 1.5× and 2× is essentially imperceptible, and the pixel
    // count drops ~30% on retina. With seven monads running on the
    // page that's a meaningful aggregate saving.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    // ── Off-screen pause ──
    // When the monad is scrolled out of view we skip the draw call,
    // keeping the RAF loop alive but at near-zero cost.
    let inView = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const uTexture = gl.getUniformLocation(program, 'uTexture');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');

    let raf = 0;
    let firstFrameDrawn = false;
    const start = performance.now();
    const render = () => {
      if (!inView) {
        raf = requestAnimationFrame(render);
        return;
      }
      tryUploadTexture();
      resize();
      if (textureUploaded) {
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTexture, 0);
        gl.uniform1f(uTime, (performance.now() - start) / 1000);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (!firstFrameDrawn) {
          firstFrameDrawn = true;
          // Now that the canvas actually has painted pixels, signal
          // the fade. setReady → React re-render → CSS opacity
          // transitions kick in for both the canvas (0 → 1, fade in)
          // and the underlying <img> (1 → 0, fade out). Cross-fading
          // is what eliminates the brief desktop overlap where the
          // un-stretched img and the vertically-stretched canvas
          // both painted at once and didn't quite line up.
          setReady(true);
        }
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      img.removeEventListener('load', onImgLoad);
      io.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [disabled, src]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        width={width}
        height={height}
        crossOrigin="anonymous"
        decoding="async"
        // React expects camelCase `fetchPriority`; the prop name is
        // lowered before being written to the DOM.
        fetchPriority={priority ? 'high' : 'auto'}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          // `fill` (the default) makes the <img> occupy the exact same
          // pixel rect as the <canvas> that fades in over it. Earlier
          // we used `contain`, which letterboxed the img inside the
          // wrapper whenever the wrapper's aspect ratio drifted even
          // slightly from the source — so when the canvas (which
          // always fills) cross-faded in, the painted swirl visibly
          // jumped/stretched. Callers must pass width/height matching
          // the source's natural aspect; with that, fill === contain
          // pixel-for-pixel, but without the failure mode.
          objectFit: 'fill',
          userSelect: 'none',
          // Cross-fade out when the GL canvas has rendered its first
          // frame. If GL never becomes ready (no WebGL2, mobile,
          // reduced-motion, or upload failure) the img stays at
          // opacity 1 as the permanent fallback.
          opacity: !disabled && ready ? 0 : 1,
          transition: 'opacity 350ms ease-out',
        }}
      />
      {!disabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: ready ? 1 : 0,
            transition: 'opacity 350ms ease-out',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

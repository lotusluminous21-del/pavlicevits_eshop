import { useFrame, useThree } from "@react-three/fiber"
import React, { useMemo, useRef, useEffect, memo } from "react"
import * as THREE from "three"

// ── Simulation scale (fraction of viewport resolution) ──────────────────────
const SIM_SCALE = 0.35
const SIM_MARGIN_TOP = 250 // Extra sim rows above viewport for hidden generators
const SUBSTEPS = 2         // Simulation substeps per frame (multiplies effective speed)

// ── Common GLSL (prepended to all simulation fragment shaders) ──────────────
const commonGLSL = /* glsl */ `
#define Bi(p) ivec2(p)
#define texel(a, p) texelFetch(a, Bi(p), 0)
#define pixel(a, p) texture(a, (p)/R)

#define PI 3.14159265
#define dt 2.5
#define mass 1.0
#define fluid_rho 0.5
#define dif 1.12

vec2 R;
vec4 Mouse;
float time;

float Pf(vec2 rho) {
    float GF = 1.0;
    return mix(0.5*rho.x, 0.04*rho.x*(rho.x/fluid_rho - 1.0), GF);
}

mat2 Rot(float ang) {
    return mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
}

vec2 Dir(float ang) {
    return vec2(cos(ang), sin(ang));
}

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

uint pack(vec2 x) {
    x = 65534.0*clamp(0.5*x + 0.5, 0.0, 1.0);
    return uint(round(x.x)) + 65535u*uint(round(x.y));
}

vec2 unpack(uint a) {
    vec2 x = vec2(a % 65535u, a / 65535u);
    return clamp(x / 65534.0, 0.0, 1.0)*2.0 - 1.0;
}

vec2 decode(float x) {
    uint X = floatBitsToUint(x);
    return unpack(X);
}

float encode(vec2 x) {
    uint X = pack(x);
    return uintBitsToFloat(X);
}

struct particle {
    vec2 X;
    vec2 V;
    vec2 M;
};

particle getParticle(vec4 data, vec2 pos) {
    particle P;
    P.X = decode(data.x) + pos;
    P.V = decode(data.y);
    P.M = data.zw;
    return P;
}

vec4 saveParticle(particle P, vec2 pos) {
    P.X = clamp(P.X - pos, vec2(-0.5), vec2(0.5));
    return vec4(encode(P.X), encode(P.V), P.M);
}

vec3 hash32(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx);
}

float G(vec2 x) {
    return exp(-dot(x, x));
}

float G0(vec2 x) {
    return exp(-length(x));
}

vec3 distribution(vec2 x, vec2 p, float K) {
    vec2 omin = clamp(x - K*0.5, p - 0.5, p + 0.5);
    vec2 omax = clamp(x + K*0.5, p - 0.5, p + 0.5);
    return vec3(0.5*(omin + omax), (omax.x - omin.x)*(omax.y - omin.y)/(K*K));
}

void Reintegration(sampler2D ch, inout particle P, vec2 pos) {
    for(int i = -2; i <= 2; i++) for(int j = -2; j <= 2; j++) {
        vec2 tpos = pos + vec2(float(i), float(j));
        vec4 data = texel(ch, tpos);
        particle P0 = getParticle(data, tpos);
        P0.X += P0.V * dt;
        float difR = 0.9 + 0.21*smoothstep(fluid_rho*0.0, fluid_rho*0.333, P0.M.x);
        vec3 D = distribution(P0.X, pos, difR);
        float m = P0.M.x * D.z;
        P.X += D.xy * m;
        P.V += P0.V * m;
        P.M.y += P0.M.y * m;
        P.M.x += m;
    }
    if(P.M.x != 0.0) {
        P.X /= P.M.x;
        P.V /= P.M.x;
        P.M.y /= P.M.x;
    }
}

void Simulation(sampler2D ch, inout particle P, vec2 pos) {
    vec2 F = vec2(0.0);
    vec3 avgV = vec3(0.0);
    for(int i = -2; i <= 2; i++) for(int j = -2; j <= 2; j++) {
        vec2 tpos = pos + vec2(float(i), float(j));
        vec4 data = texel(ch, tpos);
        particle P0 = getParticle(data, tpos);
        vec2 dx = P0.X - P.X;
        float avgP = 0.5*P0.M.x*(Pf(P.M) + Pf(P0.M));
        F -= 0.5*G(1.0*dx)*avgP*dx;
        avgV += P0.M.x*G(1.0*dx)*vec3(P0.V, 1.0);
    }
    avgV.xy /= avgV.z;
    F += 0.15*P.M.x*(avgV.xy - P.V);
    F += P.M.x*vec2(0.0, -0.00025);

    // Subtle turbulence: sine-based curl noise for organic swirling
    float tx = sin(P.X.y * 0.04 + time * 0.3) * cos(P.X.x * 0.03 + time * 0.2);
    float ty = cos(P.X.x * 0.05 - time * 0.25) * sin(P.X.y * 0.035 + time * 0.15);
    F += P.M.x * vec2(tx, ty) * 0.00015;

    // ── Interaction Forces ──────────────────────────────────────────
    // Mouse.xy = position in sim coords
    // Mouse.zw = velocity in sim coords per frame
    vec2 mVel = Mouse.zw;
    float mSpeed = length(mVel);
    
    if(mSpeed > 0.001) {
        vec2 dir = mVel / mSpeed;
        float d = distance(Mouse.xy, P.X);
        float radius = 35.0; // Interactive radius
        
        // Force falloff
        if(d < radius) {
            float strength = exp(-d*d / (radius*0.5)); // fast falloff
            // Apply drag/push force in direction of mouse movement
            // Scaled by particle mass to look consistent
            F += 0.04 * strength * mVel * P.M.x; 
            
            // Add a little divergence/splash outwards from mouse
            vec2 pushDir = normalize(P.X - Mouse.xy + 0.001);
            F += 0.01 * strength * mSpeed * pushDir * P.M.x;
        }
    }

    if(Mouse.z > 0.0) {
        // Old click logic (can keep or remove, let's keep it subtle but secondary)
        // vec2 dm = (Mouse.xy - Mouse.zw*vec2(1.0, -1.0)) / 10.0;
        // float d = distance(Mouse.xy, P.X) / 20.0;
        // F += 0.001*dm*exp(-d*d);
    } 

    P.V += F * dt / P.M.x;
    
    // ── Screen Edge Collisions ─────────────────────
    // Floor
    if (P.X.y < 5.0) {
        P.X.y = 5.0;
        P.V.y *= -0.2; // Bounce with damping
        P.V.x *= 0.9;  // Friction
    }
    // Left Wall
    if (P.X.x < 2.0) {
        P.X.x = 2.0;
        P.V.x *= -0.5;
    }
    // Right Wall
    if (P.X.x > R.x - 2.0) {
        P.X.x = R.x - 2.0;
        P.V.x *= -0.5;
    }

    float v = length(P.V);
    P.V /= (v > 4.0) ? v/4.0 : 1.0;
}

out vec4 fragColor;
`

// ── Simple vertex shader for fullscreen quad ────────────────────────────────
const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// ── Buffer A: Reintegration ─────────────────────────────────────────────────
const bufferAFrag = commonGLSL + /* glsl */ `
uniform sampler2D iChannel0;
uniform float iTime;
uniform int iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;

void main() {
    R = iResolution; time = iTime; Mouse = iMouse;
    vec2 pos = gl_FragCoord.xy;

    particle P;
    P.X = vec2(0.0); P.V = vec2(0.0); P.M = vec2(0.0);
    Reintegration(iChannel0, P, pos);

    if(iFrame < 1) {
        vec3 rand = hash32(pos);
        P.X = pos;
        P.V = vec2(0.0);
        P.M = vec2(1e-6);
    }

    // Gradual evaporation: decay mass each frame so paint fades over time
    P.M.x *= 0.9998;
    if (P.M.x < 0.001) P.M.x = 0.0;

    fragColor = saveParticle(P, pos);
}
`

// ── Buffer B: Simulation (Forces) ───────────────────────────────────────────
const bufferBFrag = commonGLSL + /* glsl */ `
uniform sampler2D iChannel0;
uniform float iTime;
uniform int iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;

void main() {
    R = iResolution; time = iTime; Mouse = iMouse;
    vec2 pos = gl_FragCoord.xy;

    vec4 data = texel(iChannel0, pos);
    particle P = getParticle(data, pos);

    if(P.M.x != 0.0) {
        Simulation(iChannel0, P, pos);
    }

    // ── Hidden generators in top margin (above visible viewport) ──
    // visibleH = R.y - margin; generators sit in the margin zone
    float margin = 250.0;
    float visibleH = R.y - margin;
    vec2 emitPos = vec2(R.x * 0.5, visibleH + 72.0); // top center, hidden above viewport

    // Emitter 1: Left side, shooting right-down (steep angle ~80deg)
    if(length(P.X - emitPos + vec2(40.0, 0.0)) < 25.0) {
        P.X = pos;
        float fluctuation = 0.05 * sin(time * 2.5);
        P.V = vec2(0.12 + fluctuation, -0.6); // Shoot right slowly
        P.M = mix(P.M, vec2(fluid_rho, 0.0), 0.5);
    }

    // Emitter 2: Right side, shooting left-down (steep angle ~80deg)
    if(length(P.X - emitPos - vec2(40.0, 0.0)) < 25.0) {
        P.X = pos;
        float fluctuation = 0.03 * cos(time * 2.0);
        P.V = vec2(-0.12 + fluctuation, -0.24); // Shoot left slowly
        P.M = mix(P.M, vec2(fluid_rho, 1.0), 0.5);
    }

    fragColor = saveParticle(P, pos);
}
`

// ── Buffer C: Density Accumulation ──────────────────────────────────────────
const bufferCFrag = commonGLSL + /* glsl */ `
uniform sampler2D iChannel0;
uniform float iTime;
uniform vec2 iResolution;

void main() {
    R = iResolution; time = iTime;
    vec2 pos = gl_FragCoord.xy;

    vec4 data = texel(iChannel0, pos);
    particle P = getParticle(data, pos);

    vec4 rho = vec4(0.0);
    for(int i = -2; i <= 2; i++) for(int j = -2; j <= 2; j++) {
        vec2 ij = vec2(float(i), float(j));
        vec4 ndata = texel(iChannel0, pos + ij);
        particle P0 = getParticle(ndata, pos + ij);
        vec2 x0 = P0.X;
        rho += 1.0*vec4(P.V, P.M)*G((pos - x0)/1.25);
    }

    fragColor = rho;
}
`

// ── Buffer D: Bilateral Filter Smoothing ────────────────────────────────────
const bufferDFrag = commonGLSL + /* glsl */ `
uniform sampler2D iChannel0; // Buffer C (Raw Density)
uniform vec2 iResolution;

void main() {
    R = iResolution;
    vec2 pos = gl_FragCoord.xy;
    
    vec4 center = texel(iChannel0, pos);
    vec4 sum = vec4(0.0);
    float norm = 0.0;
    
    // Bilateral filter parameters
    float sigmaS = 4.0; // Spatial sigma
    float sigmaR = 0.15; // Range sigma
    
    for(int i = -2; i <= 2; i++) {
        for(int j = -2; j <= 2; j++) {
            vec2 ij = vec2(float(i), float(j));
            vec4 neighbor = texel(iChannel0, pos + ij);
            
            float distS = dot(ij, ij);
            float weightS = exp(-distS / (2.0 * sigmaS * sigmaS));
            
            // Focus on density similarity (rho.z) and color similarity (rho.w)
            float distR = length(neighbor.zw - center.zw);
            float weightR = exp(-distR * distR / (2.0 * sigmaR * sigmaR));
            
            float weight = weightS * weightR;
            sum += neighbor * weight;
            norm += weight;
        }
    }
    
    fragColor = sum / max(norm, 1e-5);
}
`

// ── Image: Final Compositing ────────────────────────────────────────────────
const imageFrag = commonGLSL + /* glsl */ `
uniform sampler2D iChannel0; // Buffer B (particle data)
uniform sampler2D iChannel1; // Buffer D (smoothed density)
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 screenResolution;

vec3 hsv2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb*rgb*(3.0 - 2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 mixN(vec3 a, vec3 b, float k) {
    return sqrt(mix(a*a, b*b, clamp(k, 0.0, 1.0)));
}

vec4 V(vec2 p) {
    return texture(iChannel1, p/R);
}

void main() {
    R = iResolution; time = iTime;
    // Map screen coords to visible sim region (excludes top margin with generators)
    float visibleH = R.y - 250.0;
    vec2 pos = gl_FragCoord.xy * vec2(R.x, visibleH) / screenResolution;

    vec4 data = texel(iChannel0, pos);
    particle P = getParticle(data, pos);

    // Border logic removed
    
    vec4 rho = V(pos);
    vec3 dx = vec3(-1.25, 0.0, 1.25); // increased for smoother normal calculation
    vec4 grad = -0.5*vec4(
        V(pos + dx.zy).zw - V(pos + dx.xy).zw,
        V(pos + dx.yz).zw - V(pos + dx.yx).zw
    );
    vec2 N = pow(length(grad.xz), 0.2)*normalize(grad.xz + 1e-5);
    float specular = pow(max(dot(N, Dir(1.4)), 0.0), 3.5);

    float a = pow(smoothstep(fluid_rho*0.0, fluid_rho*2.0, rho.z), 0.1);
    float b = exp(-1.7*smoothstep(fluid_rho*1.0, fluid_rho*7.5, rho.z));
    vec3 col0 = vec3(0.055, 0.510, 0.514);  // #0E8283 teal
    vec3 col1 = vec3(0.235, 0.176, 0.357);  // #3C2D5B purple
    vec3 fcol = mixN(col0, col1, tanh(3.0*(rho.w - 0.7))*0.5 + 0.5);

    vec4 col = vec4(3.0);
    col.xyz = mixN(col.xyz, fcol.xyz*(1.5*b + specular*5.0), a);
    col.xyz = tanh(col.xyz);

    fragColor = vec4(col.xyz, 1.0);
}
`

// ── React Three Fiber Scene ─────────────────────────────────────────────────
const FluidSceneComponent = function FluidScene({
    mouseRef
}: {
    mouseRef: React.MutableRefObject<THREE.Vector4>
}) {
    const { size, gl } = useThree()
    const frame = useRef(0)

    // Simulation resolution (simFullH includes margin for hidden generators)
    const simW = Math.max(64, Math.floor(size.width * SIM_SCALE))
    const simH = Math.max(64, Math.floor(size.height * SIM_SCALE))
    const simFullH = simH + SIM_MARGIN_TOP

    // FBOs - recreate on size change
    const fbos = useMemo(() => {
        const simOpts: THREE.RenderTargetOptions = {
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
        }
        const densityOpts: THREE.RenderTargetOptions = {
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        }
        return {
            A: new THREE.WebGLRenderTarget(simW, simFullH, simOpts),
            B1: new THREE.WebGLRenderTarget(simW, simFullH, simOpts),
            B2: new THREE.WebGLRenderTarget(simW, simFullH, simOpts),
            C: new THREE.WebGLRenderTarget(simW, simFullH, densityOpts),
            D: new THREE.WebGLRenderTarget(simW, simFullH, densityOpts),
        }
    }, [simW, simFullH])

    // Cleanup FBOs
    useEffect(() => {
        return () => {
            fbos.A.dispose()
            fbos.B1.dispose()
            fbos.B2.dispose()
            fbos.C.dispose()
            fbos.D.dispose()
        }
    }, [fbos])

    // Shader Materials
    const matA = useMemo(() => new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            iChannel0: { value: null },
            iTime: { value: 0 },
            iFrame: { value: 0 },
            iResolution: { value: new THREE.Vector2(simW, simFullH) },
            iMouse: { value: new THREE.Vector4() },
        },
        vertexShader: quadVertex,
        fragmentShader: bufferAFrag,
    }), [simW, simFullH])

    const matB = useMemo(() => new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            iChannel0: { value: null },
            iTime: { value: 0 },
            iFrame: { value: 0 },
            iResolution: { value: new THREE.Vector2(simW, simFullH) },
            iMouse: { value: new THREE.Vector4() },
        },
        vertexShader: quadVertex,
        fragmentShader: bufferBFrag,
    }), [simW, simFullH])

    const matC = useMemo(() => new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            iChannel0: { value: null },
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(simW, simFullH) },
        },
        vertexShader: quadVertex,
        fragmentShader: bufferCFrag,
    }), [simW, simFullH])

    const matD = useMemo(() => new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            iChannel0: { value: null },
            iResolution: { value: new THREE.Vector2(simW, simFullH) },
        },
        vertexShader: quadVertex,
        fragmentShader: bufferDFrag,
    }), [simW, simFullH])

    const dpr = gl.getPixelRatio()
    const matImage = useMemo(() => new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            iChannel0: { value: null },
            iChannel1: { value: null },
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(simW, simFullH) },
            screenResolution: { value: new THREE.Vector2(size.width * dpr, size.height * dpr) },
        },
        vertexShader: quadVertex,
        fragmentShader: imageFrag,
    }), [simW, simFullH, size.width, size.height, dpr])

    // Scene setup
    const quadGeo = useMemo(() => new THREE.PlaneGeometry(2, 2), [])
    const cam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    const scene = useMemo(() => {
        const s = new THREE.Scene()
        s.add(new THREE.Mesh(quadGeo, matA))
        return s
    }, [quadGeo, matA])

    const setMat = (mat: THREE.ShaderMaterial) => {
        (scene.children[0] as THREE.Mesh).material = mat
    }

    // internal state for velocity calculation
    const lastMouseRef = useRef<{ x: number, y: number }>({ x: -1, y: -1 })

    // Render loop
    useFrame((state) => {
        const baseT = state.clock.elapsedTime

        // ── Mouse Velocity Calculation ───────────────────────────────────────
        const mouse = mouseRef.current
        const rawX = mouse.x
        const rawY = mouse.y
        const buttons = mouse.z // >0 is pressed (managed by HeroSection onPointerDown/Up/Move)

        // Map screen coords to simulation coords (0 to simW, 0 to simH)
        const dpr = gl.getPixelRatio()
        const nX = rawX / window.innerWidth
        const nY = rawY / window.innerHeight

        const simFullH = simH + SIM_MARGIN_TOP
        const visibleH = simFullH - SIM_MARGIN_TOP
        const targetX = nX * simW
        const targetY = nY * visibleH

        // Calculate velocity
        // Only calculate non-zero velocity if user is dragging/pressing
        const last = lastMouseRef.current
        let velX = 0
        let velY = 0

        // We update position always so we don't get a huge jump when we start clicking
        // But we only export velocity if buttons > 0

        if (last.x >= 0) {
            velX = targetX - last.x
            velY = targetY - last.y
        }

        last.x = targetX
        last.y = targetY

        // Update mouse uniform: xy = pos, zw = velocity
        // We can scale velocity to make interaction stronger/weaker
        const VEL_SCALE = 5.0

        const isInteracting = buttons > 0
        const finalVelX = isInteracting ? velX * VEL_SCALE : 0
        const finalVelY = isInteracting ? velY * VEL_SCALE : 0

        const mouseUniform = new THREE.Vector4(targetX, targetY, finalVelX, finalVelY)


        // Run multiple simulation substeps per frame for faster flow
        let bRead: THREE.WebGLRenderTarget
        let bWrite: THREE.WebGLRenderTarget

        for (let s = 0; s < SUBSTEPS; s++) {
            frame.current++
            const f = frame.current
            const t = baseT + (s / SUBSTEPS) * (1 / 60) // sub-frame time offset

            const even = f % 2 === 0
            bRead = even ? fbos.B2 : fbos.B1
            bWrite = even ? fbos.B1 : fbos.B2

            // 1. Buffer A: Reintegration (reads previous Buffer B)
            setMat(matA)
            matA.uniforms.iChannel0.value = bRead.texture
            matA.uniforms.iTime.value = t
            matA.uniforms.iFrame.value = f
            matA.uniforms.iMouse.value = mouseUniform
            gl.setRenderTarget(fbos.A)
            gl.render(scene, cam)

            // 2. Buffer B: Simulation (reads Buffer A)
            setMat(matB)
            matB.uniforms.iChannel0.value = fbos.A.texture
            matB.uniforms.iTime.value = t
            matB.uniforms.iFrame.value = f
            matB.uniforms.iMouse.value = mouseUniform
            gl.setRenderTarget(bWrite)
            gl.render(scene, cam)
        }

        // 3. Buffer C: Density (reads final Buffer B — only once)
        setMat(matC)
        matC.uniforms.iChannel0.value = bWrite!.texture
        matC.uniforms.iTime.value = baseT
        gl.setRenderTarget(fbos.C)
        gl.render(scene, cam)

        // 4. Buffer D: Smoothing (reads Buffer C)
        setMat(matD)
        matD.uniforms.iChannel0.value = fbos.C.texture
        gl.setRenderTarget(fbos.D)
        gl.render(scene, cam)

        // 5. Image: Final compositing (reads Buffer B + Buffer D — only once)
        setMat(matImage)
        matImage.uniforms.iChannel0.value = bWrite!.texture
        matImage.uniforms.iChannel1.value = fbos.D.texture
        matImage.uniforms.iTime.value = baseT
        gl.setRenderTarget(null)
        gl.render(scene, cam)

    }, 1)

    return null
}

export const FluidScene = memo(FluidSceneComponent)

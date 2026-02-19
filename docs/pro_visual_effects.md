# Visual Effects Research: World-Class Architecture & Construction Websites

## Executive Summary

This document provides comprehensive research on UI/UX visual effects used by award-winning architecture firms, luxury construction companies, and high-end real estate developers. Each effect includes implementation details, code snippets (React/TypeScript compatible), and mobile considerations specifically tailored for Apostolidis Construction.

---

## Websites Researched

### Award-Winning Architecture Firms
- **Zaha Hadid Architects** (zaha-hadid.com) - Fluid organic forms, interactive archive
- **Foster + Partners** (fosterandpartners.com) - Clean minimalism, VR/AR integration
- **BIG Architects** (big.dk) - Structured scrolling, project showcases
- **Snøhetta** (snohetta.com) - Immersive storytelling
- **KAAN Architecten** (kaanarchitecten.com) - Honorable Mention Awwwards

### Awwwards Winners (Architecture/Construction)
- **GKC Architecture & Design** by Locomotive - Site of the Day
- **BAT Architecture** - Parallax, gallery effects
- **Igloo Inc.** - Site of the Year 2024, 3D immersive experience
- **Myrtha Pools** - Honorable Mention
- **Anuc Home** - Developer Award

### Luxury Construction Companies
- **Castle Homes** - High-end photography showcase
- **Turner Construction** - Dynamic video content
- **McCarthy Construction** - Bold typography, team features
- **Brightstone** - Brand storytelling ("Live Brighter")

---

## 1. SCROLL-BASED EFFECTS

### 1.1 Smooth Scroll with Lenis

**Used By:** Most Awwwards-winning architecture sites
**Description:** Butter-smooth inertial scrolling that normalizes across devices

#### NPM Packages
```bash
npm install lenis @studio-freight/react-lenis
```

#### React Implementation
```tsx
// components/SmoothScrollProvider.tsx
'use client';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: Props) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}

// Hook to access Lenis instance
export function useScrollTo() {
  const lenis = useLenis();
  return (target: string | HTMLElement | number) => {
    lenis?.scrollTo(target, { duration: 1.5 });
  };
}
```

#### Required CSS
```css
html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-stopped {
  overflow: hidden;
}
```

**Mobile Considerations:** Lenis provides excellent touch support with configurable `touchMultiplier`. Test on iOS Safari specifically.

---

### 1.2 Parallax Scrolling with GSAP ScrollTrigger

**Used By:** BAT Architecture, Facet Architectural Design, Foster + Partners
**Description:** Creates depth by moving elements at different speeds

#### NPM Packages
```bash
npm install gsap @gsap/react
```

#### React Implementation
```tsx
// components/ParallaxSection.tsx
'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number; // 0.5 = slower, 2 = faster
  className?: string;
}

export function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className 
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

#### Hero Parallax Background
```tsx
// components/HeroParallax.tsx
'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HeroParallaxProps {
  imageSrc: string;
  overlayOpacity?: number;
}

export function HeroParallax({ imageSrc, overlayOpacity = 0.4 }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !imageRef.current) return;

    gsap.to(imageRef.current, {
      yPercent: 30,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <div
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: overlayOpacity }} 
      />
    </div>
  );
}
```

**Mobile Considerations:** Reduce parallax intensity on mobile (speed * 0.3). Consider disabling for `prefers-reduced-motion`.

---

### 1.3 Horizontal Scroll Section

**Used By:** CANALS Amsterdam, Modern portfolio sites
**Description:** Horizontal scrolling gallery triggered by vertical scroll

```tsx
// components/HorizontalScroll.tsx
'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      wrapperRef.current.children
    );

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => `+=${wrapperRef.current!.scrollWidth}`,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className}>
      <div 
        ref={wrapperRef} 
        className="flex h-screen"
        style={{ width: 'max-content' }}
      >
        {children}
      </div>
    </div>
  );
}

// Usage
export function ProjectGallery() {
  const projects = ['Project 1', 'Project 2', 'Project 3'];
  
  return (
    <HorizontalScroll>
      {projects.map((project, i) => (
        <div key={i} className="w-screen h-screen flex-shrink-0 p-20">
          <h2>{project}</h2>
        </div>
      ))}
    </HorizontalScroll>
  );
}
```

**Mobile Considerations:** Convert to standard vertical scroll on mobile (< 768px). Horizontal scroll can be unintuitive on touch.

---

### 1.4 Scroll Progress Indicator

**Used By:** Long-form architecture case studies
**Description:** Visual indicator showing page scroll progress

```tsx
// components/ScrollProgress.tsx
'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  color?: string;
  height?: number;
}

export function ScrollProgress({ 
  color = '#C45C26', // Terracotta
  height = 3 
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 origin-left"
      style={{
        scaleX,
        height,
        backgroundColor: color,
      }}
    />
  );
}
```

---

### 1.5 Sticky/Pinned Sections with Content Reveal

**Used By:** Zaha Hadid, BIG Architects project pages
**Description:** Pin content while scrolling reveals new information

```tsx
// components/PinnedReveal.tsx
'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface RevealItem {
  title: string;
  description: string;
  image: string;
}

interface PinnedRevealProps {
  items: RevealItem[];
}

export function PinnedReveal({ items }: PinnedRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const textSections = gsap.utils.toArray<HTMLElement>('.reveal-text');
    
    textSections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to('.reveal-image', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              gsap.set('.reveal-image', { 
                backgroundImage: `url(${items[i].image})` 
              });
              gsap.to('.reveal-image', { opacity: 1, duration: 0.3 });
            },
          });
        },
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative">
      {/* Pinned Image */}
      <div className="sticky top-0 h-screen w-1/2 float-left">
        <div
          ref={imageRef}
          className="reveal-image h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${items[0].image})` }}
        />
      </div>

      {/* Scrolling Text Content */}
      <div className="w-1/2 ml-auto">
        {items.map((item, i) => (
          <div 
            key={i} 
            className="reveal-text min-h-screen flex items-center p-20"
          >
            <div>
              <h2 className="text-4xl font-light mb-6">{item.title}</h2>
              <p className="text-lg text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Mobile Considerations:** Stack vertically on mobile - image above, text below. Remove sticky behavior.

---

## 2. IMAGE & GALLERY EFFECTS

### 2.1 Image Reveal with Clip-Path

**Used By:** GKC Architecture, Modern portfolios
**Description:** Images reveal with directional clip-path animation

```tsx
// components/ImageReveal.tsx
'use client';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

type RevealDirection = 'left' | 'right' | 'top' | 'bottom' | 'center';

interface ImageRevealProps {
  src: string;
  alt: string;
  direction?: RevealDirection;
  className?: string;
}

const clipPaths: Record<RevealDirection, { start: string; end: string }> = {
  left: {
    start: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
    end: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },
  right: {
    start: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
    end: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },
  top: {
    start: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    end: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },
  bottom: {
    start: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
    end: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },
  center: {
    start: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    end: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },
};

export function ImageReveal({ 
  src, 
  alt, 
  direction = 'left',
  className 
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { clipPath: clipPaths[direction].start },
      {
        clipPath: clipPaths[direction].end,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover" 
        style={{ transition: 'none !important' }}
      />
    </div>
  );
}
```

---

### 2.2 Project Card Hover Effects

**Used By:** Zaha Hadid Architects, KAAN Architecten
**Description:** Elegant hover states for project cards

```tsx
// components/ProjectCard.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  href: string;
}

export function ProjectCard({ title, category, image, href }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={href}
      className="block relative overflow-hidden group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <motion.span
          className="text-sm text-white/80 uppercase tracking-wider block mb-2"
          animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {category}
        </motion.span>
        <motion.h3
          className="text-2xl text-white font-light"
          animate={{ y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {title}
        </motion.h3>
      </div>

      {/* Arrow Icon */}
      <motion.div
        className="absolute top-6 right-6"
        animate={{ 
          x: isHovered ? 0 : -20, 
          opacity: isHovered ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2"
        >
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </motion.div>
    </motion.a>
  );
}
```

---

### 2.3 Ken Burns Effect (Subtle Zoom)

**Used By:** Luxury real estate, Architecture hero sections
**Description:** Slow zoom on images for cinematic feel

```tsx
// components/KenBurnsImage.tsx
'use client';
import { motion } from 'framer-motion';

interface KenBurnsImageProps {
  src: string;
  alt: string;
  duration?: number;
  scale?: number;
  className?: string;
}

export function KenBurnsImage({ 
  src, 
  alt, 
  duration = 20,
  scale = 1.1,
  className 
}: KenBurnsImageProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </div>
  );
}
```

---

### 2.4 WebGL Image Displacement on Hover

**Used By:** Igloo Inc., High-end creative agencies
**Description:** Liquid/gooey distortion effect on image hover

#### NPM Packages
```bash
npm install three @react-three/fiber hover-effect
```

#### Simple Implementation (hover-effect library)
```tsx
// components/DisplacementImage.tsx
'use client';
import { useRef, useEffect } from 'react';
import hoverEffect from 'hover-effect';

interface DisplacementImageProps {
  image1: string;
  image2: string;
  displacementImage?: string;
  intensity?: number;
}

export function DisplacementImage({
  image1,
  image2,
  displacementImage = '/textures/displacement.png',
  intensity = 0.3,
}: DisplacementImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const effect = new hoverEffect({
      parent: containerRef.current,
      intensity1: intensity,
      intensity2: intensity,
      angle: Math.PI / 4,
      image1,
      image2,
      displacementImage,
      speedIn: 1.2,
      speedOut: 1.2,
    });

    return () => {
      // Cleanup if needed
    };
  }, [image1, image2, displacementImage, intensity]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}
```

#### Advanced Three.js Implementation
```tsx
// components/AdvancedDisplacement.tsx
'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Calculate distance from mouse
    float dist = distance(uv, uMouse);
    
    // Create displacement
    float strength = smoothstep(0.3, 0.0, dist) * uHover * 0.1;
    vec2 displacement = normalize(uv - uMouse) * strength;
    
    // Sample texture with displacement
    vec4 color = texture2D(uTexture, uv + displacement);
    
    gl_FragColor = color;
  }
`;

function DisplacementPlane({ image }: { image: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(image);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
    }),
    [texture]
  );

  useFrame(({ pointer }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uMouse.value.lerp(
        new THREE.Vector2(
          (pointer.x + 1) / 2,
          (pointer.y + 1) / 2
        ),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1]}
      onPointerEnter={() => {
        const material = meshRef.current?.material as THREE.ShaderMaterial;
        if (material) material.uniforms.uHover.value = 1;
      }}
      onPointerLeave={() => {
        const material = meshRef.current?.material as THREE.ShaderMaterial;
        if (material) material.uniforms.uHover.value = 0;
      }}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function AdvancedDisplacement({ image }: { image: string }) {
  return (
    <div className="w-full h-[500px]">
      <Canvas>
        <DisplacementPlane image={image} />
      </Canvas>
    </div>
  );
}
```

**Mobile Considerations:** Disable WebGL effects on mobile or low-power devices. Use simpler CSS transitions instead.

---

## 3. TEXT ANIMATIONS

### 3.1 Split Text Animation with GSAP

**Used By:** GKC Architecture, Locomotive sites
**Description:** Animate text character by character or word by word

#### NPM Packages
```bash
npm install gsap @gsap/react
# For premium SplitText plugin (requires Club GreenSock membership)
# Or use free alternative: splitting
npm install splitting
```

#### Free Alternative with Splitting.js
```tsx
// components/SplitTextReveal.tsx
'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextRevealProps {
  children: string;
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  className?: string;
}

export function SplitTextReveal({ 
  children, 
  type = 'chars',
  stagger = 0.02,
  className 
}: SplitTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const results = Splitting({ target: ref.current, by: type });
    const elements = results[0][type];

    gsap.set(elements, { opacity: 0, y: 50 });

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [type, stagger]);

  return (
    <div ref={ref} className={className} data-splitting>
      {children}
    </div>
  );
}
```

#### Manual Implementation (No External Dependencies)
```tsx
// components/AnimatedHeadline.tsx
'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedHeadline({ 
  text, 
  className,
  delay = 0 
}: AnimatedHeadlineProps) {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
    },
  };

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-[0.25em]"
          variants={child}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
```

---

### 3.2 Text Reveal on Scroll (Line by Line)

**Used By:** Foster + Partners, Snøhetta
**Description:** Text lines reveal with mask animation as they scroll into view

```tsx
// components/TextRevealScroll.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface TextRevealScrollProps {
  children: string;
  className?: string;
}

export function TextRevealScroll({ children, className }: TextRevealScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 60%'],
  });

  const lines = children.split('\n');

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <LineReveal 
          key={i} 
          line={line} 
          index={i} 
          total={lines.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function LineReveal({ 
  line, 
  index, 
  total, 
  progress 
}: { 
  line: string; 
  index: number; 
  total: number;
  progress: any;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const y = useTransform(progress, [start, end], [20, 0]);

  return (
    <motion.p style={{ opacity, y }} className="my-2">
      {line}
    </motion.p>
  );
}
```

---

### 3.3 Typewriter Effect

**Used By:** Minimal portfolio sites
**Description:** Text appears character by character

```tsx
// components/Typewriter.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function Typewriter({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className,
}: TypewriterProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[2px] h-[1em] bg-current ml-1"
      />
    </span>
  );
}
```

---

## 4. CURSOR & INTERACTION EFFECTS

### 4.1 Custom Cursor

**Used By:** Creative agencies, Igloo Inc.
**Description:** Replace default cursor with custom animated element

```tsx
// components/CustomCursor.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface CustomCursorProps {
  color?: string;
}

export function CustomCursor({ color = '#C45C26' }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor-hover]'
    );
    
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => setIsHovering(true));
      el.addEventListener('mouseleave', () => setIsHovering(false));
    });

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            width: isHovering ? 60 : 8,
            height: isHovering ? 60 : 8,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full border"
          style={{ borderColor: color }}
          animate={{
            width: isHovering ? 80 : 32,
            height: isHovering ? 80 : 32,
            opacity: isVisible ? 0.5 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      </motion.div>

      {/* Hide default cursor globally */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        @media (hover: none) and (pointer: coarse) {
          * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
}
```

**Mobile Considerations:** Always hide custom cursor on touch devices. Use media query `(hover: none)` for detection.

---

### 4.2 Magnetic Button Effect

**Used By:** Codrops examples, Creative agencies
**Description:** Button content follows cursor with magnetic pull

```tsx
// components/MagneticButton.tsx
'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      <motion.span
        className="block"
        animate={{ x: position.x * 0.5, y: position.y * 0.5 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
```

---

### 4.3 Hover State Transitions

**Used By:** All premium architecture sites
**Description:** Sophisticated hover states with staggered elements

```tsx
// components/NavLink.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: string;
}

export function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href} className="group relative overflow-hidden block py-2">
      {/* Original text */}
      <motion.span
        className="block"
        initial={{ y: 0 }}
        whileHover={{ y: '-100%' }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.span>

      {/* Duplicate text */}
      <motion.span
        className="absolute top-0 left-0 block text-terracotta"
        initial={{ y: '100%' }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        aria-hidden
      >
        {children}
      </motion.span>
    </Link>
  );
}
```

---

## 5. WEBGL/SHADER EFFECTS

### 5.1 Noise/Grain Overlay

**Used By:** Film-inspired sites, Luxury brands
**Description:** Subtle film grain effect for texture

```tsx
// components/GrainOverlay.tsx
'use client';
import { useEffect, useRef } from 'react';

export function GrainOverlay({ opacity = 0.05 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const noise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(noise);
    };

    resize();
    noise();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ 
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
```

#### CSS-Only Grain Alternative (Better Performance)
```css
/* styles/grain.css */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
}

.grain-overlay::before {
  content: '';
  position: absolute;
  inset: -200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='https://i.ytimg.com/vi/1bYAwpPPD6U/mqdefault.jpg id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  animation: grain 0.5s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}
```

---

### 5.2 Smooth Page Transitions

**Used By:** Locomotive, High-end portfolios
**Description:** Full-page transitions with clip-path or fade effects

```tsx
// components/PageTransition.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

#### Clip-Path Reveal Transition
```tsx
// components/ClipPathTransition.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const clipVariants = {
  initial: {
    clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
  },
  enter: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  exit: {
    clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

export function ClipPathTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={clipVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 6. MICRO-INTERACTIONS

### 6.1 Loading States

**Used By:** All premium sites
**Description:** Elegant loading indicators

```tsx
// components/LoadingSpinner.tsx
'use client';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  color?: string;
  size?: number;
}

export function LoadingSpinner({ 
  color = '#C45C26', 
  size = 40 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="rounded-full border-2 border-transparent"
        style={{
          width: size,
          height: size,
          borderTopColor: color,
          borderRightColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Page loader with logo
export function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
        <LoadingSpinner />
      </motion.div>
    </motion.div>
  );
}
```

---

### 6.2 Button Feedback

**Used By:** All interactive sites
**Description:** Visual and haptic feedback on button interactions

```tsx
// components/Button.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary',
  onClick,
  className 
}: ButtonProps) {
  const baseStyles = 'relative px-8 py-4 font-medium overflow-hidden';
  
  const variants = {
    primary: 'bg-terracotta text-white',
    secondary: 'bg-slate-900 text-white',
    outline: 'border-2 border-slate-900 text-slate-900',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Background animation on hover */}
      <motion.span
        className="absolute inset-0 bg-black"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        style={{ originX: 0 }}
      />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
```

---

### 6.3 Form Input Interactions

**Used By:** Contact forms, Quote requests
**Description:** Animated labels and validation states

```tsx
// components/FormInput.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}

export function FormInput({
  label,
  name,
  type = 'text',
  required,
  error,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');

  const isActive = isFocused || value.length > 0;

  return (
    <div className="relative">
      {/* Floating Label */}
      <motion.label
        htmlFor={name}
        className="absolute left-4 pointer-events-none text-gray-500"
        animate={{
          y: isActive ? -24 : 16,
          scale: isActive ? 0.85 : 1,
          color: isFocused ? '#C45C26' : '#6B7280',
        }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full pt-6 pb-2 px-4 border-b-2 bg-transparent
          outline-none transition-colors
          ${error ? 'border-red-500' : isFocused ? 'border-terracotta' : 'border-gray-300'}
        `}
      />

      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-terracotta"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.span
            className="text-red-500 text-sm mt-1 block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 7. NPM PACKAGE SUMMARY

| Package | Purpose | Size | Use Case |
|---------|---------|------|----------|
| `gsap` | Animation library | ~60KB | Scroll animations, complex sequences |
| `@gsap/react` | React integration | ~5KB | useGSAP hook for cleanup |
| `lenis` | Smooth scrolling | ~4KB | Butter-smooth scroll |
| `@studio-freight/react-lenis` | React Lenis | ~2KB | React provider wrapper |
| `framer-motion` | React animations | ~150KB | Declarative animations |
| `three` | 3D graphics | ~150KB | WebGL effects |
| `@react-three/fiber` | React Three.js | ~40KB | React wrapper for Three.js |
| `@react-three/drei` | Three.js helpers | ~100KB | Pre-built components |
| `splitting` | Text splitting | ~3KB | Character/word animations |
| `hover-effect` | Image displacement | ~10KB | WebGL hover effects |

---

## TOP 5-7 RECOMMENDATIONS FOR APOSTOLIDIS

Based on the **mobile-first requirement**, **minimalist aesthetic**, **performance (Core Web Vitals)**, **"stability" brand theme**, and **Mediterranean/terracotta accent**, here are the recommended effects:

### ✅ 1. **Smooth Scroll with Lenis** (ESSENTIAL)
- **Why:** Creates premium feel with minimal performance impact
- **Performance:** < 4KB, runs on main thread
- **Mobile:** Excellent touch support
- **Brand Fit:** Smooth, stable, professional

### ✅ 2. **Image Reveal with Clip-Path** (HIGH IMPACT)
- **Why:** Elegant project reveals without heavy dependencies
- **Performance:** CSS-based with GSAP enhancement
- **Mobile:** Works perfectly, no issues
- **Brand Fit:** Clean, architectural, reveals craftsmanship

### ✅ 3. **Text Animation (Word-by-Word Reveal)** (BRAND IDENTITY)
- **Why:** Adds sophistication to headlines and values
- **Performance:** Minimal with Framer Motion
- **Mobile:** Reduces stagger on mobile for speed
- **Brand Fit:** Measured, deliberate, emphasizes key messages

### ✅ 4. **Project Card Hover Effects** (ENGAGEMENT)
- **Why:** Essential for portfolio browsing
- **Performance:** CSS transforms only
- **Mobile:** Touch-friendly, works as tap states
- **Brand Fit:** Professional, showcases work quality

### ✅ 5. **Scroll Progress Indicator** (USABILITY)
- **Why:** Helps users understand page length
- **Performance:** Framer Motion spring physics
- **Mobile:** Thin line, not intrusive
- **Brand Fit:** Terracotta accent color, functional

### ✅ 6. **Magnetic Buttons** (OPTIONAL - DESKTOP ONLY)
- **Why:** Premium interactive feel
- **Performance:** Light JavaScript
- **Mobile:** Disable completely
- **Brand Fit:** Subtle, professional interaction

### ⚠️ 7. **Subtle Grain Overlay** (OPTIONAL)
- **Why:** Adds texture and warmth
- **Performance:** Use CSS-only version
- **Mobile:** Reduce opacity or disable
- **Brand Fit:** Mediterranean warmth, artisanal feel

---

## EFFECTS TO AVOID

| Effect | Reason |
|--------|--------|
| Heavy WebGL displacement | Poor mobile performance |
| Custom cursor | Not mobile-friendly |
| Horizontal scroll sections | Confusing on mobile |
| Complex shader effects | Battery drain, performance |
| Parallax with many layers | Performance on older devices |

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Core - Week 1)
1. Lenis smooth scroll setup
2. Image reveal on project pages
3. Basic text animations on hero

### Phase 2 (Enhancement - Week 2)
4. Project card hover effects
5. Scroll progress indicator
6. Page transitions

### Phase 3 (Polish - Week 3)
7. Magnetic buttons (desktop only)
8. Grain overlay (optional)
9. Micro-interactions refinement

---

## PERFORMANCE CHECKLIST

- [ ] Bundle size < 200KB total for animation libraries
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Test on 3G throttled connection
- [ ] Test on iPhone SE (smallest viewport)
- [ ] Test on Android mid-range device
- [ ] Respect `prefers-reduced-motion` media query

---

## ACCESSIBILITY CONSIDERATIONS

```tsx
// hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage in components
const reducedMotion = useReducedMotion();

<motion.div
  animate={{ opacity: 1, y: reducedMotion ? 0 : 20 }}
  transition={{ duration: reducedMotion ? 0 : 0.5 }}
>
```

---

## CONCLUSION

This document provides a comprehensive toolkit for implementing world-class visual effects for the Apostolidis Construction website. The recommended effects balance **premium aesthetics** with **mobile performance** and **brand alignment**. 

Focus on subtle, purposeful animations that enhance the user experience without overwhelming the content. The "less is more" approach aligns perfectly with both the minimalist design aesthetic and the construction industry's values of **stability** and **reliability**.

---

*Document prepared: February 2026*
*Research sources: Awwwards, Zaha Hadid Architects, Foster + Partners, GKC Architecture, Locomotive, Codrops, GSAP Documentation*

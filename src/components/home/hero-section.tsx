"use client"

import Image from "next/image"
import { FluidScene } from "./fluid-scene"
import { TrustBar } from "./trust-bar"
import { Canvas } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { motion, useScroll, useTransform } from "framer-motion"

export function HeroSection() {
    const mouseRef = useRef<THREE.Vector4>(new THREE.Vector4(0, 0, -1, 0))
    const containerRef = useRef<HTMLElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    const handlePointerMove = (e: React.PointerEvent) => {
        // ... existing logic if any, but it was empty/commented out in previous view ...
    }

    return (
        <section ref={containerRef} className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
            {/* Fluid Simulation Background */}
            <div className="absolute inset-0 z-0 scale-105">
                <Canvas
                    camera={{ position: [0, 0, 1] }}
                    gl={{ preserveDrawingBuffer: true, alpha: true }}
                    dpr={[1, 2]} // Support high usage
                    onPointerMove={(e) => {
                        mouseRef.current.set(e.clientX, window.innerHeight - e.clientY, e.buttons > 0 ? 1 : -1, 0)
                    }}
                    onPointerDown={(e) => {
                        mouseRef.current.z = 1
                    }}
                    onPointerUp={(e) => {
                        mouseRef.current.z = -1
                    }}
                >
                    <FluidScene mouseRef={mouseRef} />
                </Canvas>
            </div>

            {/* Overlay Content with Parallax */}
            <motion.div
                style={{ y, opacity }}
                className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center pb-32 pointer-events-none invert mix-blend-difference"
            >
                <Image
                    src="/svg/logotype.svg"
                    alt="Pavlicevits"
                    width={993}
                    height={144}
                    className="w-full max-w-3xl h-auto"
                    priority
                />
            </motion.div>

            {/* Bottom Glass Panel */}
            <TrustBar />
        </section>
    )
}

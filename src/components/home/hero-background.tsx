"use client"

import React, { useEffect, useRef } from "react"

const SIM_SCALE = 0.5

export function HeroBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const workerRef = useRef<Worker | null>(null)
    const pointerRef = useRef({ x: 0, y: 0, z: -1, w: 0 })

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return

        const canvas = canvasRef.current
        const container = containerRef.current

        // Detect OffscreenCanvas support
        if (!('transferControlToOffscreen' in canvas)) {
            console.warn("OffscreenCanvas not in this browser")
            // Fallback logic could go here, but for now we assume support
            return
        }

        const worker = new Worker(new URL('./hero.worker', import.meta.url))
        workerRef.current = worker

        const offscreen = canvas.transferControlToOffscreen()
        const dpr = window.devicePixelRatio
        const rect = container.getBoundingClientRect()

        worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: rect.width,
            height: rect.height,
            dpr: dpr
        }, [offscreen])

        // ── Event Handlers ──────────────────────────────────────────────────

        const handleResize = () => {
            const rect = container.getBoundingClientRect()
            worker.postMessage({
                type: 'resize',
                width: rect.width,
                height: rect.height,
                dpr: window.devicePixelRatio
            })
        }

        const handlePointerMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect()
            const x = (e.clientX - rect.left) * SIM_SCALE
            const y = (rect.height - (e.clientY - rect.top)) * SIM_SCALE

            // If pointer is down, allow "drawing"
            if (pointerRef.current.z > 0) {
                pointerRef.current.x = x
                pointerRef.current.y = y
                pointerRef.current.z = x // mouse.z maps to mouseX for some shader logic? or click state?
                // In the shader: 
                // if(Mouse.z > 0.0) applies force.
                // The original code:
                // mouseRef.current.set(x, y, x, -y) // on down
                // mouseRef.current.set(x, y, lastPointer.current.x, -lastPointer.current.y) // on move if down

                // Let's replicate the original logic precisely.
                // Original: 
                // onDown: set(x, y, x, -y)
                // onMove (if down): set(x, y, lastX, -lastY)
                // onUp: z = -1
            }
            // Just basic tracking for now
        }

        // We need to replicate the exact mouse vector logic from the original component
        // for the shader to behave identically.
        let lastPointer = { x: 0, y: 0 }
        let isDown = false

        const onPointerDown = (e: PointerEvent) => {
            isDown = true
            const rect = container.getBoundingClientRect()
            const x = (e.clientX - rect.left) * SIM_SCALE
            const y = (rect.height - (e.clientY - rect.top)) * SIM_SCALE
            lastPointer = { x, y }

            worker.postMessage({
                type: 'pointer',
                x: x,
                y: y,
                z: x,
                w: -y
            })
            canvas.setPointerCapture(e.pointerId)
        }

        const onPointerMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect()
            const x = (e.clientX - rect.left) * SIM_SCALE
            const y = (rect.height - (e.clientY - rect.top)) * SIM_SCALE

            if (isDown) {
                worker.postMessage({
                    type: 'pointer',
                    x: x,
                    y: y,
                    z: lastPointer.x,
                    w: -lastPointer.y
                })
                lastPointer = { x, y }
            }
        }

        const onPointerUp = (e: PointerEvent) => {
            isDown = false
            canvas.releasePointerCapture(e.pointerId)
            // z = -1 (signal stop)
            worker.postMessage({
                type: 'pointer',
                x: 0, // values don't matter as long as z < 0
                y: 0,
                z: -1,
                w: 0
            })
        }

        window.addEventListener('resize', handleResize)
        // Attach pointer events to the container (or window if capturing?)
        // The original used canvas events. Since the canvas is still in DOM, just "transferred", 
        // we can still attach events to it?
        // MDN: "Note that the placeholder canvas is still a valid DOM element, but you cannot use its 2D context."
        // Events should still work.
        canvas.addEventListener('pointerdown', onPointerDown)
        canvas.addEventListener('pointermove', onPointerMove)
        canvas.addEventListener('pointerup', onPointerUp)
        canvas.addEventListener('pointerleave', onPointerUp)

        return () => {
            worker.terminate()
            window.removeEventListener('resize', handleResize)
            canvas.removeEventListener('pointerdown', onPointerDown)
            canvas.removeEventListener('pointermove', onPointerMove)
            canvas.removeEventListener('pointerup', onPointerUp)
            canvas.removeEventListener('pointerleave', onPointerUp)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full"
            style={{ transform: 'scale(1.01)' }}
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ touchAction: 'none' }}
            />
        </div>
    )
}

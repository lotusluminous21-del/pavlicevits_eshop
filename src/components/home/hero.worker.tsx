import { createRoot, events } from "@react-three/fiber"
import { FluidScene } from "./fluid-scene"
import * as THREE from "three"
import React, { useRef } from "react"

// Defines the event types for the worker
type WorkerMessage =
    | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; dpr: number }
    | { type: "resize"; width: number; height: number; dpr: number }
    | { type: "pointer"; x: number; y: number; z: number; w: number }

// We use a shared mutable object for the mouse state that the scene can read each frame
// This avoids react re-renders on every mouse move
const mouseRef = { current: new THREE.Vector4(0, 0, -1, 0) }

const Scene = () => {
    return <FluidScene mouseRef={mouseRef} />
}

let root: ReturnType<typeof createRoot> | undefined

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { data } = event

    if (data.type === "init") {
        const { canvas, width, height, dpr } = data

        // Configure the offscreen canvas
        // @ts-ignore - OffscreenCanvas type compatibility in R3F
        root = createRoot(canvas)

        root.configure({
            dpr: dpr,
            size: { width, height, top: 0, left: 0 },
            gl: {
                antialias: false,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false,
            },
            camera: { position: [0, 0, 1], near: 0.1, far: 1000 },
            // Disable default event handling since we manage pointer manually via messages
            events: (store) => ({ ...events(store), enabled: false }),
        })

        root.render(<Scene />)

    } else if (data.type === "resize") {
        const { width, height, dpr } = data
        root?.configure({ size: { width, height, top: 0, left: 0 }, dpr })
    } else if (data.type === "pointer") {
        const { x, y, z, w } = data
        mouseRef.current.set(x, y, z, w)
    }
}

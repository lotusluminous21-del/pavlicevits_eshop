"use client"

import { ReactLenis } from "@studio-freight/react-lenis"

interface SmoothScrollProps {
    children: React.ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis
            root
            options={{
                duration: 1.2,
                // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Optional custom easing
            }}
        >
            <>{children}</>
        </ReactLenis>
    )
}

import React, { useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';

export interface BorderGlowProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    glowRadius?: number;
    borderRadius?: string;
}

export function BorderGlow({
    children,
    className = '',
    glowColor = 'rgba(99, 102, 241, 0.6)',
    glowRadius = 300,
    borderRadius = '1rem',
}: BorderGlowProps) {
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-9999);
    const mouseY = useMotionValue(-9999);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    function handleMouseLeave() {
        mouseX.set(-9999);
        mouseY.set(-9999);
    }

    const glowBackground = useMotionTemplate`radial-gradient(${glowRadius}px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`;

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            style={{ borderRadius }}
            onMouseMove={reducedMotion ? undefined : handleMouseMove}
            onMouseLeave={reducedMotion ? undefined : handleMouseLeave}
        >
            {!reducedMotion && (
                <motion.div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{ background: glowBackground, borderRadius }}
                />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

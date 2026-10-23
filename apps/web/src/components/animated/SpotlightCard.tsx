import React, { useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';

export interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightRadius?: number;
    spotlightColor?: string;
    backgroundColor?: string;
}

export function SpotlightCard({
    children,
    className = '',
    spotlightRadius = 200,
    spotlightColor = 'rgba(255, 255, 255, 0.15)',
    backgroundColor = 'transparent',
}: SpotlightCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    const background = useMotionTemplate`radial-gradient(${spotlightRadius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

    if (reducedMotion) {
        return (
            <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ backgroundColor }}>
                {children}
            </div>
        );
    }

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ backgroundColor }} onMouseMove={handleMouseMove}>
            <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ background }} />
            {children}
        </div>
    );
}

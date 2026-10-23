import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export interface TiltedCardProps {
    children: React.ReactNode;
    className?: string;
    tiltMaxAngle?: number;
    showGlare?: boolean;
    glareOpacity?: number;
}

export function TiltedCard({
    children,
    className = '',
    tiltMaxAngle = 8,
    showGlare = true,
    glareOpacity = 0.25,
}: TiltedCardProps) {
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const rotateXRaw = useMotionValue(0);
    const rotateYRaw = useMotionValue(0);
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);

    const rotateX = useSpring(rotateXRaw, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(rotateYRaw, { stiffness: 300, damping: 30 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const fractionX = (e.clientX - centerX) / (rect.width / 2);
        const fractionY = (e.clientY - centerY) / (rect.height / 2);
        rotateYRaw.set(fractionX * tiltMaxAngle);
        rotateXRaw.set(-fractionY * tiltMaxAngle);
        glareX.set((e.clientX - rect.left) / rect.width * 100);
        glareY.set((e.clientY - rect.top) / rect.height * 100);
    }

    function handleMouseLeave() {
        rotateXRaw.set(0);
        rotateYRaw.set(0);
    }

    if (reducedMotion) {
        return <div className={`relative overflow-hidden ${className}`}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={`relative overflow-hidden ${className}`}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {showGlare && (
                <motion.div
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}), transparent 60%)`,
                    }}
                />
            )}
        </motion.div>
    );
}

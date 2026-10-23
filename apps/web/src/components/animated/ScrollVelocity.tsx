import React, { useRef } from 'react';
import { motion, useMotionValue, useScroll, useVelocity, useAnimationFrame, useReducedMotion } from 'framer-motion';

export interface ScrollVelocityProps {
    text: string;
    className?: string;
    baseSpeed?: number;
    velocityMultiplier?: number;
    fontSize?: string;
}

export function ScrollVelocity({
    text,
    className = '',
    baseSpeed = 50,
    velocityMultiplier = 0.1,
    fontSize = '2rem',
}: ScrollVelocityProps) {
    const reducedMotion = useReducedMotion();
    const x = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useAnimationFrame((_, delta) => {
        if (!containerRef.current || !innerRef.current || reducedMotion) return;
        const containerWidth = containerRef.current.offsetWidth;
        const innerWidth = innerRef.current.offsetWidth / 2;
        const velocityBoost = scrollVelocity.get() * velocityMultiplier;
        const speed = baseSpeed + Math.abs(velocityBoost);
        let current = x.get();
        current -= (speed * delta) / 1000;
        if (current <= -innerWidth) current += innerWidth;
        x.set(current);
    });

    if (reducedMotion) {
        return (
            <div className={`overflow-hidden whitespace-nowrap ${className}`} style={{ fontSize }}>
                <span className="inline-block mr-8">{text}</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`} style={{ fontSize }}>
            <motion.div ref={innerRef} className="inline-flex" style={{ x }}>
                <span className="inline-block mr-16">{text}</span>
                <span className="inline-block mr-16">{text}</span>
                <span className="inline-block mr-16">{text}</span>
                <span className="inline-block mr-16">{text}</span>
            </motion.div>
        </div>
    );
}

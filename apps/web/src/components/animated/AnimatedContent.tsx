import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, Variants } from 'framer-motion';

export interface AnimatedContentProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
    blur?: number;
    fadeIn?: boolean;
    duration?: number;
    delay?: number;
    rootMargin?: string;
    once?: boolean;
    disableAnimations?: boolean;
}

export function AnimatedContent({
    children,
    className = '',
    direction = 'up',
    distance = 40,
    blur = 0,
    fadeIn = true,
    duration = 0.5,
    delay = 0,
    rootMargin = '-50px',
    once = true,
    disableAnimations = false,
}: AnimatedContentProps) {
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: rootMargin as any });

    if (reducedMotion || disableAnimations) {
        return <div className={className}>{children}</div>;
    }

    const getHidden = (): Record<string, any> => {
        const base: Record<string, any> = {};
        if (fadeIn) base.opacity = 0;
        if (blur > 0) base.filter = `blur(${blur}px)`;
        if (direction === 'up') base.y = distance;
        else if (direction === 'down') base.y = -distance;
        else if (direction === 'left') base.x = distance;
        else if (direction === 'right') base.x = -distance;
        return base;
    };

    const getVisible = (): Record<string, any> => {
        const base: Record<string, any> = { opacity: 1 };
        if (blur > 0) base.filter = 'blur(0px)';
        if (direction === 'up' || direction === 'down') base.y = 0;
        else if (direction === 'left' || direction === 'right') base.x = 0;
        return base;
    };

    const variants: Variants = {
        hidden: getHidden(),
        visible: getVisible(),
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={variants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

import React, { useRef, useEffect, useState } from 'react';
import { useMotionValue, animate, useInView, useReducedMotion } from 'framer-motion';

export interface CountUpProps {
    to: number;
    from?: number;
    className?: string;
    duration?: number;
    delay?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    animateOnView?: boolean;
    rootMargin?: string;
}

export function CountUp({
    to,
    from = 0,
    className = '',
    duration = 2,
    delay = 0,
    decimals = 0,
    prefix = '',
    suffix = '',
    animateOnView = true,
    rootMargin = '-50px',
}: CountUpProps) {
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: rootMargin as any });
    const motionValue = useMotionValue(from);
    const [display, setDisplay] = useState(formatNumber(reducedMotion ? to : from, decimals));

    function formatNumber(n: number, d: number) {
        return n.toFixed(d);
    }

    useEffect(() => {
        if (reducedMotion) {
            setDisplay(formatNumber(to, decimals));
            return;
        }
        const shouldAnimate = animateOnView ? isInView : true;
        if (!shouldAnimate) return;
        const controls = animate(motionValue, to, {
            duration,
            delay,
            ease: 'easeOut',
            onUpdate: (val) => setDisplay(formatNumber(val, decimals)),
        });
        return () => controls.stop();
    }, [isInView, reducedMotion, to]);

    return (
        <span ref={ref} className={className}>
            {prefix}{display}{suffix}
        </span>
    );
}

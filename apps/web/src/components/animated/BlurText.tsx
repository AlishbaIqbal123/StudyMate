import React, { useRef, useEffect, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

export interface BlurTextProps {
    text: string;
    className?: string;
    duration?: number;
    delay?: number;
    blurAmount?: number;
    animateOnView?: boolean;
    rootMargin?: string;
}

export function BlurText({
    text,
    className = '',
    duration = 1000,
    delay = 0,
    blurAmount = 20,
    animateOnView = false,
    rootMargin = '-50px',
}: BlurTextProps) {
    const reducedMotion = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: rootMargin as any });
    const [hasAnimated, setHasAnimated] = useState(false);

    const shouldAnimate = animateOnView ? isInView : true;

    useEffect(() => {
        if (reducedMotion || hasAnimated || !shouldAnimate || !ref.current) return;
        setHasAnimated(true);
        const el = ref.current;
        el.style.opacity = '0';
        el.style.filter = `blur(${blurAmount}px)`;
        const timer = setTimeout(() => {
            animate(el, { opacity: 1, filter: 'blur(0px)' }, { duration: duration / 1000, ease: 'easeOut' });
        }, delay);
        return () => clearTimeout(timer);
    }, [shouldAnimate, reducedMotion]);

    if (reducedMotion) {
        return <span className={className}>{text}</span>;
    }

    return (
        <span
            ref={ref}
            className={className}
            style={{ opacity: 0, filter: `blur(${blurAmount}px)`, display: 'inline-block' }}
        >
            {text}
        </span>
    );
}

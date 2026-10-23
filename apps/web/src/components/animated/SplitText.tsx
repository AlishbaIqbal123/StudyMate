import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

export interface SplitTextProps {
    text: string;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
    staggerInterval?: number;
    easing?: string;
    charDuration?: number;
    delay?: number;
}

export function SplitText({
    text,
    className = '',
    direction = 'up',
    staggerInterval = 40,
    easing = 'easeOut',
    charDuration = 400,
    delay = 0,
}: SplitTextProps) {
    const reducedMotion = useReducedMotion();

    if (reducedMotion) {
        return <span className={className}>{text}</span>;
    }

    const getHidden = (): Record<string, any> => {
        const base: Record<string, any> = { opacity: 0 };
        if (direction === 'up') base.y = 20;
        else if (direction === 'down') base.y = -20;
        else if (direction === 'left') base.x = 20;
        else if (direction === 'right') base.x = -20;
        return base;
    };

    const getVisible = (): Record<string, any> => {
        const base: Record<string, any> = { opacity: 1 };
        if (direction === 'up' || direction === 'down') base.y = 0;
        else if (direction === 'left' || direction === 'right') base.x = 0;
        return base;
    };

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerInterval / 1000,
                delayChildren: delay / 1000,
            },
        },
    };

    const charVariants: Variants = {
        hidden: getHidden(),
        visible: {
            ...getVisible(),
            transition: { duration: charDuration / 1000, ease: easing as any },
        },
    };

    return (
        <motion.span
            className={`inline-block ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    className="inline-block"
                    variants={charVariants}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.span>
    );
}

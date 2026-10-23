import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ShinyTextProps {
    text: string;
    className?: string;
    duration?: number;
    trigger?: 'hover' | 'loop';
    sheenColor?: string;
    textColor?: string;
}

export function ShinyText({
    text,
    className = '',
    duration = 3,
    trigger = 'loop',
    sheenColor = 'rgba(255, 255, 255, 0.8)',
    textColor = 'inherit',
}: ShinyTextProps) {
    const reducedMotion = useReducedMotion();

    if (reducedMotion) {
        return <span className={className} style={{ color: textColor }}>{text}</span>;
    }

    const shimmerStyle: React.CSSProperties = {
        backgroundImage: `linear-gradient(105deg, transparent 40%, ${sheenColor} 50%, transparent 60%)`,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
    };

    if (trigger === 'loop') {
        return (
            <motion.span
                className={className}
                style={shimmerStyle}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration, repeat: Infinity, ease: 'linear' }}
            >
                {text}
            </motion.span>
        );
    }

    return (
        <motion.span
            className={className}
            style={shimmerStyle}
            initial={{ backgroundPosition: '200% 0' }}
            whileHover={{ backgroundPosition: '-200% 0' }}
            transition={{ duration }}
        >
            {text}
        </motion.span>
    );
}

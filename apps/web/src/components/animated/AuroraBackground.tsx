import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AuroraBackgroundProps {
    className?: string;
    colors?: string[];
    blobCount?: number;
    duration?: number;
}

const BLOB_POSITIONS = [
    { left: '10%', top: '20%' },
    { left: '60%', top: '10%' },
    { left: '30%', top: '60%' },
    { left: '80%', top: '50%' },
    { left: '50%', top: '80%' },
];

export function AuroraBackground({
    className = '',
    colors = [
        'rgba(229, 169, 82, 0.15)',
        'rgba(59, 130, 246, 0.10)',
        'rgba(16, 185, 129, 0.08)',
    ],
    blobCount = 3,
    duration = 15,
}: AuroraBackgroundProps) {
    const reducedMotion = useReducedMotion();
    const count = Math.min(blobCount, colors.length, BLOB_POSITIONS.length);

    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
            style={{ zIndex: 0 }}
        >
            {Array.from({ length: count }).map((_, i) => {
                const pos = BLOB_POSITIONS[i];
                const color = colors[i % colors.length];
                if (reducedMotion) {
                    return (
                        <div
                            key={i}
                            className="absolute rounded-full blur-3xl"
                            style={{
                                width: '40vw',
                                height: '40vw',
                                left: pos.left,
                                top: pos.top,
                                background: `radial-gradient(circle, ${color}, transparent 70%)`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    );
                }
                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: '40vw',
                            height: '40vw',
                            left: pos.left,
                            top: pos.top,
                            background: `radial-gradient(circle, ${color}, transparent 70%)`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                            x: [0, 60, -40, 0],
                            y: [0, -50, 30, 0],
                            scale: [1, 1.2, 0.9, 1],
                            opacity: [0.6, 1, 0.7, 0.6],
                        }}
                        transition={{
                            duration: duration + i * 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * (duration / count),
                        }}
                    />
                );
            })}
        </div>
    );
}

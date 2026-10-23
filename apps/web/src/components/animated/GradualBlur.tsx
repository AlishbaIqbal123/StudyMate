import React from 'react';
import { useReducedMotion } from 'framer-motion';

export interface GradualBlurProps {
    children?: React.ReactNode;
    className?: string;
    direction?: 'top' | 'bottom' | 'left' | 'right';
    blurAmount?: number;
    transitionZone?: string;
}

export function GradualBlur({
    children,
    className = '',
    direction = 'bottom',
    blurAmount = 12,
    transitionZone = '100px',
}: GradualBlurProps) {
    const reducedMotion = useReducedMotion();

    const getMaskImage = () => {
        switch (direction) {
            case 'top': return 'linear-gradient(to bottom, transparent 0%, black 100%)';
            case 'bottom': return 'linear-gradient(to top, transparent 0%, black 100%)';
            case 'left': return 'linear-gradient(to right, transparent 0%, black 100%)';
            case 'right': return 'linear-gradient(to left, transparent 0%, black 100%)';
        }
    };

    const getOverlayStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            backdropFilter: `blur(${blurAmount}px)`,
            WebkitBackdropFilter: `blur(${blurAmount}px)`,
            maskImage: getMaskImage(),
            WebkitMaskImage: getMaskImage(),
        };
        if (direction === 'bottom') {
            return { ...base, bottom: 0, left: 0, right: 0, height: transitionZone };
        } else if (direction === 'top') {
            return { ...base, top: 0, left: 0, right: 0, height: transitionZone };
        } else if (direction === 'left') {
            return { ...base, top: 0, bottom: 0, left: 0, width: transitionZone };
        } else {
            return { ...base, top: 0, bottom: 0, right: 0, width: transitionZone };
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {children}
            {!reducedMotion && <div style={getOverlayStyle()} />}
        </div>
    );
}

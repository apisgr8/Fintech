import React from 'react';
import type { MacdData } from '../types';

interface TrendPrismProps {
    macd: MacdData;
}

export const TrendPrism: React.FC<TrendPrismProps> = ({ macd }) => {
    const isBullish = macd.histogram >= 0;
    // Normalize histogram for visual effect (glow intensity)
    // This is a simple heuristic, a real implementation might use ATR or price %
    const momentumStrength = Math.min(1, Math.abs(macd.histogram) / 5);

    const glowColor = isBullish ? 'rgba(0, 208, 132, 0.9)' : 'rgba(255, 82, 82, 0.9)';
    const prismColor = isBullish ? 'rgb(0, 208, 132)' : 'rgb(255, 82, 82)';
    
    // Scale the glow radius based on momentum
    const glowRadius = 4 + momentumStrength * 12;

    const prismStyle: React.CSSProperties = {
        transform: isBullish ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.5s ease-in-out',
        filter: `drop-shadow(0 0 ${glowRadius}px ${glowColor})`,
    };
    
    return (
        <div className="w-24 h-32 flex items-center justify-center">
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                style={prismStyle}
            >
                <path
                    d="M12 2 L2 22 L22 22 Z"
                    fill={prismColor}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="0.5"
                />
            </svg>
        </div>
    );
};
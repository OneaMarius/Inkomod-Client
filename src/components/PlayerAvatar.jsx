// File: Client/src/components/PlayerAvatar.jsx
import React from 'react';
import { generateSvgPathAndViewBox } from '../utils/ShapeRenderer';

const PlayerAvatar = ({ visualProfile, size = 40 }) => {
    // If no profile exists (e.g., legacy data), render a generic gray fallback shape
    if (!visualProfile) {
        return (
            <div style={{ width: size, height: size, backgroundColor: '#444', borderRadius: '4px' }}></div>
        );
    }

    const { pathData, viewBox } = generateSvgPathAndViewBox(visualProfile);
    
    // Generate a unique ID for the SVG gradient using the color string
    const gradientId = `player-grad-${visualProfile.colorStop1.replace(/[^\w]/gi, '')}`;

    return (
        <svg 
            width={size} 
            height={size} 
            viewBox={viewBox} 
            style={{ display: 'block' }}
        >
            <defs>
                <linearGradient 
                    id={gradientId} 
                    gradientTransform={`rotate(${visualProfile.gradientAngle})`}
                >
                    <stop offset="0%" stopColor={visualProfile.colorStop1} />
                    <stop offset="50%" stopColor={visualProfile.colorStop2} />
                    <stop offset="100%" stopColor={visualProfile.colorStop3} />
                </linearGradient>
            </defs>
            <path 
                d={pathData} 
                fill={`url(#${gradientId})`} 
                stroke="#fff" 
                strokeWidth="2" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

export default PlayerAvatar;
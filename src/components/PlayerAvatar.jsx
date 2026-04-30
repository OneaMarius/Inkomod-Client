// File: Client/src/components/PlayerAvatar.jsx
import React, { useId } from 'react';
import { generateSvgPathAndViewBox } from '../utils/ShapeRenderer';

const PlayerAvatar = ({ visualProfile, size = 40 }) => {
    // Generăm un ID unic, sigur pentru DOM (React 18+)
    const uniqueId = useId();

    // Dacă profilul nu există sau este incomplet, afișăm fallback-ul
    if (!visualProfile || !visualProfile.colorStop1) {
        return (
            <div style={{ width: size, height: size, backgroundColor: '#444', borderRadius: '4px' }}></div>
        );
    }

    const { pathData, viewBox } = generateSvgPathAndViewBox(visualProfile);
    
    // Eliminăm caracterele speciale din ID-ul generat de React
    const gradientId = `player-grad-${uniqueId.replace(/:/g, '')}`;
    
    // EXTRAGEREA CORECTĂ:
    // parseFloat va lua '135deg' și va returna doar numărul 135, pe care SVG-ul îl înțelege.
    const angle = parseFloat(visualProfile.gradientAngle) || 0;

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
                    /* Adăugăm 0.5, 0.5 pentru ca gradientul să se rotească perfect din centrul formei */
                    gradientTransform={`rotate(${angle}, 0.5, 0.5)`}
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
// File: Client/src/components/KnightAvatar.jsx
import React from 'react';

const KnightAvatar = ({ src, visualProfile, size = '100%', alt = 'Knight' }) => {
    const backgroundStyle = visualProfile 
        ? `linear-gradient(${visualProfile.gradientAngle}deg, ${visualProfile.colorStop1}, ${visualProfile.colorStop2}, ${visualProfile.colorStop3})`
        : '#444';

    // Check if the size is a number (e.g., 50) and add 'px', otherwise use the string (e.g., '100%')
    const formattedSize = typeof size === 'number' ? `${size}px` : size;

    return (
        <div style={{
            width: formattedSize,
            height: formattedSize,
            background: backgroundStyle,
            padding: '3px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            boxSizing: 'border-box' // Ensures padding is calculated inwards
        }}>
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#1a1a1a'
                }}
                onError={(e) => {
                    const fallbackPath = '/avatars/default_knight.png';
                    if (!e.target.src.includes(fallbackPath)) {
                        e.target.src = fallbackPath;
                    }
                }}
            />
        </div>
    );
};

export default KnightAvatar;
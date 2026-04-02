// File: Client/src/components/NpcAvatar.jsx
import React from 'react';

const NpcAvatar = ({ src, primaryFallback, secondaryFallback, rank = 1, size = '100%', alt = 'Enemy' }) => {
	const formattedSize = typeof size === 'number' ? `${size}px` : size;

	// Map the rank to the global CSS variables defined in your index.css
	const getRankColor = (r) => {
		switch (r) {
			case 1:
				return 'var(--q0)';
			case 2:
				return 'var(--q1)';
			case 3:
				return 'var(--q2)';
			case 4:
				return 'var(--q3)';
			case 5:
				return 'var(--q4)';
			default:
				return 'var(--q0)';
		}
	};

	return (
		<div
			style={{
				width: formattedSize,
				height: formattedSize,
				background: getRankColor(rank),
				padding: '3px',
				borderRadius: '50%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 0 10px rgba(0,0,0,0.5)',
				boxSizing: 'border-box',
			}}
		>
			<img
				src={src}
				alt={alt}
				style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#1a1a1a' }}
				onError={(e) => {
					// 2-Tier Fallback logic for enemies
					if (primaryFallback && e.target.src.includes(src)) {
						e.target.src = primaryFallback;
					} else if (secondaryFallback && e.target.src.includes(primaryFallback)) {
						e.target.src = secondaryFallback;
					} else {
						const ultimateFallback = '/avatars/default_npc.png';
						if (!e.target.src.includes(ultimateFallback)) {
							e.target.src = ultimateFallback;
						}
					}
				}}
			/>
		</div>
	);
};

export default NpcAvatar;

// File: Client/src/components/NpcAvatar.jsx
import React from 'react';

const NpcAvatar = ({ src, rank = 1, size = '100%', alt = 'Enemy', onError }) => {
	const formattedSize = typeof size === 'number' ? `${size}px` : size;

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
				borderRadius: '50%', // CRITIC: Face componenta rotundă
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 0 10px rgba(0,0,0,0.5)',
				boxSizing: 'border-box',
				overflow: 'hidden', // CRITIC: Taie colțurile imaginii pătrate
			}}
		>
			<img
				src={src}
				alt={alt}
				style={{
					width: '100%',
					height: '100%',
					borderRadius: '50%', // Extra siguranță
					objectFit: 'cover',
					backgroundColor: '#1a1a1a',
					display: 'block',
				}}
				onError={onError} // Permite fallback-ului extern (Taxonomia din HallOfFame) să funcționeze
			/>
		</div>
	);
};

export default NpcAvatar;

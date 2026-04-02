// File: Client/src/pages/HallOfFame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import LegacyModal from '../components/LegacyModal';
import styles from '../styles/HallOfFame.module.css';

import { identifyEntityFromName, getEntityAvatar, getFallbackAvatar } from '../utils/AvatarResolver';
import PlayerAvatar from '../components/PlayerAvatar';
import KnightAvatar from '../components/KnightAvatar';

const HallOfFame = () => {
	const navigate = useNavigate();
	const [leaderboard, setLeaderboard] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedKnight, setSelectedKnight] = useState(null);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const response = await api.get('/legacy');
				setLeaderboard(response.data);
			} catch (err) {
				setError(getStandardErrorMessage(err));
			} finally {
				setIsLoading(false);
			}
		};

		fetchLeaderboard();
	}, []);

	const openDetails = (knight) => setSelectedKnight(knight);
	const closeDetails = () => setSelectedKnight(null);

	const handleImgError = (e, entityType, entityName = '') => {
		let fallbackSrc = '/avatars/default_npc.png';

		if (entityType === 'KNIGHT') {
			fallbackSrc = '/avatars/default_knight.png';
		} else if (entityType === 'PLAYER') {
			fallbackSrc = '/avatars/default_player.png';
		} else if (entityType === 'KILLER') {
			const { category } = identifyEntityFromName(entityName);
			if (category) {
				fallbackSrc = getFallbackAvatar(category);
			}
		}

		// Prevent infinite loop if fallback image is missing
		if (e.target.src !== window.location.origin + fallbackSrc) {
			e.target.src = fallbackSrc;
		}
	};

	const getRankColorClass = (index) => {
		if (index === 0) return styles.rank1;
		if (index === 1) return styles.rank2;
		if (index === 2) return styles.rank3;
		if (index === 3) return styles.rank4;
		if (index === 4) return styles.rank5;
		return styles.rankDefault;
	};

	const getKillerAvatar = (entry) => {
		if (!entry.killerName || entry.killerName === 'None') return '/avatars/default_npc.png';

		// Ignore legacy placeholders when calculating dynamic avatars
		const ignoredPlaceholders = ['default.png', 'default_npc.png', 'npc.png'];

		if (entry.killerAvatar && !ignoredPlaceholders.includes(entry.killerAvatar)) {
			return `/avatars/${entry.killerAvatar}`;
		}

		const { category, subclass } = identifyEntityFromName(entry.killerName);
		return getEntityAvatar(category, subclass);
	};

	return (
		<div className={styles.hallOfFamePage}>
			<div className={styles.header}>
				<h1>HALL OF FAME</h1>
			</div>

			{error && <div className='system-error-box'>{error}</div>}

			<div className={styles.tableContainer}>
				{isLoading ? (
					<div className={styles.loadingState}>Decrypting archives...</div>
				) : (
					<table className={styles.legacyTable}>
						<thead>
							<tr>
								<th style={{ width: '15%' }}>Pos</th>
								<th style={{ width: '20%' }}>Score</th>
								<th style={{ width: '40%', textAlign: 'left', paddingLeft: '1.5rem' }}>Knight&Player</th>
								<th style={{ width: '25%' }}>Log</th>
							</tr>
						</thead>
						<tbody>
							{leaderboard.map((entry, index) => {
								const rankColorClass = getRankColorClass(index);

								return (
									<tr key={entry._id}>
										<td className={`${styles.rankCell} ${rankColorClass}`}>{index + 1}</td>
										<td className={`${styles.scoreCell} ${rankColorClass}`}>{entry.finalScore.toLocaleString()}</td>
										<td>
											<div className={styles.stackedIdentity}>
												{/* Knight Row */}
												<div className={styles.identityRow}>
													<KnightAvatar
														src={`/avatars/${entry.knightAvatar || 'default_knight.png'}`}
														visualProfile={entry.visualProfile}
														size={24}
													/>
													<span className={styles.knightName}>{entry.knightName}</span>
												</div>
												{/* Player Row */}
												<div className={styles.identityRow}>
													<PlayerAvatar
														visualProfile={entry.visualProfile}
														size={24}
													/>
													<span className={styles.playerName}>{entry.username}</span>
												</div>
											</div>
										</td>
										<td>
											<button
												className={styles.infoBtn}
												onClick={() => {
													const knightWithKillerAvatar = { ...entry, calculatedKillerAvatar: getKillerAvatar(entry) };
													openDetails(knightWithKillerAvatar);
												}}
											>
												INFO
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			<Button onClick={() => navigate('/main-menu')}>Return to Menu</Button>

			<LegacyModal
				knight={selectedKnight}
				closeDetails={closeDetails}
				handleImgError={handleImgError}
			/>
		</div>
	);
};

export default HallOfFame;

// File: Client/src/pages/HallOfFame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy';
import LegacyModal from '../components/LegacyModal';
import styles from '../styles/HallOfFame.module.css';

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

	// Dynamic Fallback logic for broken images using DB_NPC_TAXONOMY
	const handleImgError = (e, entityType, entityName = '') => {
		let fallbackSrc = '/avatars/default_npc.png';

		if (entityType === 'KNIGHT') {
			fallbackSrc = '/avatars/default_knight.png';
		} else if (entityType === 'PLAYER') {
			fallbackSrc = '/avatars/default_player.png';
		} else if (entityType === 'KILLER') {
			const nameLower = entityName.toLowerCase().replace(/_/g, ' ');

			// Helper function to extract and normalize taxonomy terms
			const normalizeArray = (arr) => arr.flat().map((name) => name.toLowerCase().replace(/_/g, ' '));

			// Extract keywords dynamically from the Taxonomy
			const monsters = normalizeArray(Object.values(DB_NPC_TAXONOMY.Monster.subclasses));
			const nephilims = normalizeArray(Object.values(DB_NPC_TAXONOMY.Nephilim.subclasses));

			// Extract animals and append specific horse nomenclature
			let animals = normalizeArray(Object.values(DB_NPC_TAXONOMY.Animal.subclasses));
			const horseNames = normalizeArray(DB_NPC_TAXONOMY.Animal.nomenclature.Mount.Horse.baseNamesByRank);
			animals = [...animals, ...horseNames];

			// Evaluate classification priority
			if (nephilims.some((keyword) => nameLower.includes(keyword))) {
				fallbackSrc = '/avatars/default_nephilim.png';
			} else if (monsters.some((keyword) => nameLower.includes(keyword))) {
				fallbackSrc = '/avatars/default_monster.png';
			} else if (animals.some((keyword) => nameLower.includes(keyword))) {
				fallbackSrc = '/avatars/default_animal.png';
			} else if (nameLower !== 'none' && nameLower !== 'unknown assailant') {
				fallbackSrc = '/avatars/default_human.png';
			}
		}

		e.target.src = fallbackSrc;
	};

	// Determine CSS class based on rank position
	const getRankColorClass = (index) => {
		if (index === 0) return styles.rank1;
		if (index === 1) return styles.rank2;
		if (index === 2) return styles.rank3;
		if (index === 3) return styles.rank4;
		if (index === 4) return styles.rank5;
		return styles.rankDefault;
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
													<img
														src={`/avatars/${entry.knightAvatar}`}
														className={styles.tinyAvatar}
														onError={(e) => handleImgError(e, 'KNIGHT')}
														alt='K'
													/>
													<span className={styles.knightName}>{entry.knightName}</span>
												</div>
												{/* Player Row */}
												<div className={styles.identityRow}>
													<img
														src={`/avatars/${entry.playerAvatar}`}
														className={styles.tinyAvatar}
														onError={(e) => handleImgError(e, 'PLAYER')}
														alt='P'
													/>
													<span className={styles.playerName}>{entry.username}</span>
												</div>
											</div>
										</td>
										<td>
											<button
												className={styles.infoBtn}
												onClick={() => openDetails(entry)}
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

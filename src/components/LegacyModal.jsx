// File: Client/src/components/LegacyModal.jsx
import React, { useEffect } from 'react';
import styles from '../styles/LegacyModal.module.css';
import PlayerAvatar from './PlayerAvatar';
import KnightAvatar from './KnightAvatar';
import NpcAvatar from './NpcAvatar';

const LegacyModal = ({ knight, closeDetails, handleImgError }) => {
	useEffect(() => {
		if (knight) {
			console.log('=== LEGACY MODAL OPENED ===', knight);
		}
	}, [knight]);

	const getRankColor = (rank) => {
		switch (rank) {
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
				return '#aaa';
		}
	};

	if (!knight) return null;

	// Procedural Chronicle Generator
	const generateStory = (data) => {
		const {
			knightName,
			rank,
			reputationClass,
			patronGod,
			totalTurns,
			deathSeason,
			deathYear,
			deathZone,
			deathRegion,
			causeOfDeath,
			killerName,
			honor,
			renown,
			inventory,
		} = data;

		const godText = patronGod !== 'None' ? `guided by the divine will of ${patronGod}` : `relying solely on mortal grit`;

		const wealthText =
			inventory?.silverCoins > 0 || inventory?.tradeSilver > 0 || inventory?.tradeGold > 0
				? `a notable fortune (S:${inventory?.silverCoins || 0}, TS:${inventory?.tradeSilver || 0}, TG:${inventory?.tradeGold || 0})`
				: `little to no material wealth`;

		let deathText = '';
		if (causeOfDeath === 'Slain in Combat') {
			deathText = `fell in brutal combat against ${killerName}`;
		} else if (causeOfDeath === 'Starvation') {
			deathText = `succumbed to the slow agony of starvation`;
		} else if (causeOfDeath === 'Old Age') {
			deathText = `passed away as time finally claimed its toll`;
		} else {
			deathText = `met an untimely end due to ${causeOfDeath}`;
		}

		return `The archives record the tale of ${knightName}, a Tier ${rank} ${reputationClass}. 
        They survived for ${totalTurns} months across the realm, ${godText}. 
        Through their deeds, they amassed ${renown} renown and ${honor} honor. 
        However, every journey has an end. In the ${deathSeason} of ${deathYear}, deep within ${deathZone} (${deathRegion}), they ${deathText}. 
        They left this world leaving behind ${wealthText}, a caravan of ${inventory?.caravanSize || 0} beasts, and a backpack holding ${inventory?.backpackSize || 0} items. 
        Their legacy is now etched in the Hall of Fame.`;
	};

	return (
		<div
			className={styles.modalOverlay}
			onClick={closeDetails}
		>
			<div
				className={styles.modalContent}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header: Dual Identity */}
				<div className={styles.modalHeader}>
					<div className={styles.dualIdentityContainer}>
						{/* Player Profile */}
						<div className={styles.profileBox}>
							<PlayerAvatar
								visualProfile={knight.visualProfile}
								size={48}
							/>
							<span className={styles.profileRole}>The Player</span>
							<span className={styles.profileName}>{knight.username}</span>
						</div>

						<div className={styles.identityDivider}>⚔️</div>

						{/* Knight Profile */}
						<div className={styles.profileBox}>
							<KnightAvatar
								src={`/avatars/${knight.knightAvatar || 'default_knight.png'}`}
								visualProfile={knight.visualProfile}
								size={48}
							/>
							<span className={styles.profileRole}>The Knight</span>
							<span
								className={styles.profileName}
								style={{ color: '#d32f2f' }}
							>
								{knight.knightName}
							</span>
						</div>
					</div>

					<p className={styles.epitaph}>
						Tier {knight.rank} {knight.reputationClass} {knight.patronGod !== 'None' ? `| Follower of ${knight.patronGod}` : ''}
					</p>
				</div>

				<div className={styles.modalBody}>
					<h3 className={styles.sectionDivider}>THE CHRONICLE</h3>
					<p className={styles.storyText}>{generateStory(knight)}</p>

					<h3 className={styles.sectionDivider}>THE FINAL MOMENTS</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Date of Fall</span>
						<span className={styles.statValue}>
							{knight.deathSeason}, Year {knight.deathYear}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Location</span>
						<span className={styles.statValue}>
							{knight.deathZone} <span style={{ color: '#888', fontSize: '0.8em' }}>({knight.deathRegion})</span>
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Fate</span>
						<span
							className={styles.statValue}
							style={{ color: '#ff4d4d' }}
						>
							{knight.causeOfDeath}
						</span>
					</div>

					{knight.killerName !== 'None' && (
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Slain By</span>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								{/* Numele Inamicului Colorat */}
								<span
									className={styles.statValue}
									style={{ color: getRankColor(knight.killerRank), fontWeight: 'bold' }}
								>
									{knight.killerName}
								</span>

								{/* Avatarul Pătrat cu Border */}
								<NpcAvatar
									src={knight.calculatedKillerAvatar}
									rank={knight.killerRank || 1}
									size={40}
									alt='Killer'
									onError={(e) => handleImgError(e, 'KILLER', knight.killerName)}
								/>
							</div>
						</div>
					)}

					<h3 className={styles.sectionDivider}>PROGRESSION</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Age at Death</span>
						<span className={styles.statValue}>{knight.age} Years Old</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Time Survived</span>
						<span className={styles.statValue}>{knight.totalTurns} Months</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Honor / Renown</span>
						<span className={styles.statValue}>
							{knight.honor} / {knight.renown}
						</span>
					</div>

					<h3 className={styles.sectionDivider}>LEGACY ASSETS</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Wealth</span>
						<span className={styles.statValue}>
							S:{knight.inventory?.silverCoins || 0} | TS:{knight.inventory?.tradeSilver || 0} | TG:{knight.inventory?.tradeGold || 0}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Food / Potions</span>
						<span className={styles.statValue}>
							{knight.inventory?.food || 0} / {knight.inventory?.healingPotions || 0}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Caravan / Backpack Size</span>
						<span className={styles.statValue}>
							{knight.inventory?.caravanSize || 0} Beasts / {knight.inventory?.backpackSize || 0} Items
						</span>
					</div>

					<div className={styles.finalScoreRow}>
						<span
							className={styles.statLabel}
							style={{ fontSize: '1.2rem', color: '#fff' }}
						>
							TOTAL SCORE
						</span>
						<span className={styles.scoreHighlight}>{knight.finalScore.toLocaleString()}</span>
					</div>
				</div>

				<button
					className={styles.closeBtn}
					onClick={closeDetails}
				>
					CLOSE RECORD
				</button>
			</div>
		</div>
	);
};

export default LegacyModal;

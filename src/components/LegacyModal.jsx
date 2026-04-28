// File: Client/src/components/LegacyModal.jsx
import React from 'react';
import styles from '../styles/LegacyModal.module.css';
import PlayerAvatar from './PlayerAvatar';
import KnightAvatar from './KnightAvatar';
import NpcAvatar from './NpcAvatar';
import { WORLD } from '../data/GameWorld.js';
import { getEntityAvatar } from '../utils/AvatarResolver.js'; // <-- IMPORT RESOLVER HERE

const LegacyModal = ({ knight, closeDetails, handleImgError }) => {
	if (!knight) return null;

	const isVictory = knight.causeOfDeath === 'Survived';
	// Determine the exact killer subtitle string based on taxonomy
	let killerSubtitle = '';

	if (!isVictory && knight.killerCategory && knight.killerCategory !== 'None') {
		const cat = knight.killerCategory;
		const cls = knight.killerClass;
		const sub = knight.killerSubclass;

		if (cat === 'Human') {
			killerSubtitle = sub && sub !== 'None' ? sub : cls !== 'None' ? cls : '';
		} else if (cat === 'Animal') {
			const prefix = cls && cls !== 'None' ? cls : 'Wild';
			killerSubtitle = `${prefix} Animal`;
		} else if (cat === 'Monster' || cat === 'Nephilim') {
			killerSubtitle = cls && cls !== 'None' ? cls : cat;
		} else {
			killerSubtitle = cls && cls !== 'None' ? cls : cat;
		}
	}
	/**
	 * Dynamically calculates the full title using WORLD data.
	 * Logic: [Honor Prefix] [Rank Title]
	 */
	const calculateFullTitle = (rank, honor) => {
		const safeRank = Math.max(1, Math.min(5, rank || 1));
		const safeHonor = honor || 0;

		const rankTitles = WORLD.SOCIAL.rankTitles;
		const { good, evil } = WORLD.MORALITY.titles;
		const { goodMin, evilMax } = WORLD.MORALITY.alignment;

		const baseTitle = rankTitles[safeRank];
		let prefix = 'Neutral';

		if (safeHonor >= goodMin) {
			prefix = good[safeRank];
		} else if (safeHonor <= evilMax) {
			prefix = evil[safeRank];
		}

		return prefix === 'Neutral' ? `Neutral ${baseTitle}` : `${prefix} ${baseTitle}`;
	};

	const fullTitle = calculateFullTitle(knight.rank, knight.honor);

	// --- KILLER AVATAR RESOLUTION LOGIC ---
	let finalKillerAvatar = '/avatars/default_npc.png';

	if (!isVictory && knight.killerCategory && knight.killerCategory !== 'None') {
		// Use the utility that perfectly routes taxonomy to images
		const resolvedPath = getEntityAvatar(knight.killerCategory, knight.killerClass, knight.killerSubclass);
		if (resolvedPath) finalKillerAvatar = resolvedPath;
	} else if (knight.killerAvatar && !['default_npc.png', 'default_human.png', 'npc.png'].includes(knight.killerAvatar)) {
		// Fallback for older enemies or unique ones that already have a valid string
		finalKillerAvatar = knight.killerAvatar.includes('/') ? knight.killerAvatar : `/avatars/${knight.killerAvatar}`;
	}
	// ----------------------------------------------------

	/**
	 * Procedural Story Generator
	 * Combines all knight attributes into a cohesive narrative.
	 */
	const generateStory = (data) => {
		const { knightName, patronGod, totalTurns, deathSeason, deathYear, deathZone, deathRegion, causeOfDeath, killerName, honor, renown, inventory } = data;

		const godText = patronGod !== 'None' ? `guided by the divine will of ${patronGod}` : `relying solely on mortal grit`;

		const wealthText =
			inventory?.silverCoins > 0 || inventory?.tradeSilver > 0 || inventory?.tradeGold > 0
				? `a significant fortune (Silver: ${inventory.silverCoins || 0}, Trade Goods: ${(inventory.tradeSilver || 0) + (inventory.tradeGold || 0)})`
				: `modest worldly possessions`;

		let chronicleEnd = '';

		if (isVictory) {
			chronicleEnd = `Their journey did not end in a grave, but in the annals of legend. In the ${deathSeason} of ${deathYear}, within the ${deathZone} of the ${deathRegion}, they stood victorious. Known henceforth as a ${killerName}, they retired from the path of blood. They left the battlefield with ${wealthText}, leading a caravan of ${inventory?.caravanSize || 0} beasts. Their name is now a beacon of hope, etched forever in the Hall of Fame.`;
		} else {
			// --- NEW TAXONOMY BASED KILLER DESCRIPTION LOGIC ---
			let enrichedKillerDesc = killerName;
			const category = data.killerCategory;
			const kClass = data.killerClass;
			const kSubclass = data.killerSubclass;

			if (category === 'Human') {
				const job = kSubclass && kSubclass !== 'None' ? kSubclass : kClass;
				enrichedKillerDesc = `${killerName}, a deadly ${job}`;
			} else if (category === 'Animal') {
				enrichedKillerDesc = `a deadly ${killerName}`;
			} else if (category === 'Monster' || category === 'Nephilim') {
				enrichedKillerDesc = `${killerName}, a member of the ${kClass || 'ancient horrors'}`;
			}

			const deathMap = {
				'Slain in Combat': `fell in a desperate struggle against ${enrichedKillerDesc}`,
				Starvation: `succumbed to the silent shadow of starvation`,
				'Old Age': `passed away as the sands of time finally ran out`,
			};
			const fateDescription = deathMap[causeOfDeath] || `met an untimely end due to ${causeOfDeath}`;

			chronicleEnd = `Every saga eventually finds its end. In the ${deathSeason} of ${deathYear}, while traversing ${deathZone} in the ${deathRegion}, they ${fateDescription}. They departed this world leaving behind ${wealthText} and a caravan of ${inventory?.caravanSize || 0} beasts. Their tragic but brave legacy is now recorded for posterity.`;
		}

		return `The archives tell of ${knightName}, a ${fullTitle} who walked the lands for ${totalTurns} months. ${godText}, they amassed ${renown} renown and ${honor} honor. ${chronicleEnd}`;
	};

	const getRankColor = (rank) => {
		const colors = ['#aaa', 'var(--q0)', 'var(--q1)', 'var(--q2)', 'var(--q3)', 'var(--q4)'];
		return colors[rank] || colors[0];
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
				{/* HEADER: Dual Identity Section */}
				<div className={styles.modalHeader}>
					<div className={styles.dualIdentityContainer}>
						<div className={styles.profileBox}>
							<PlayerAvatar
								visualProfile={knight.visualProfile}
								size={48}
							/>
							<span className={styles.profileRole}>The Player</span>
							<span className={styles.profileName}>{knight.username}</span>
						</div>

						<div
							className={styles.identityDivider}
							style={{ color: isVictory ? '#fbbf24' : '#555' }}
						>
							{isVictory ? '👑' : '⚔️'}
						</div>

						<div className={styles.profileBox}>
							<KnightAvatar
								src={`/avatars/${knight.knightAvatar || 'default_knight.png'}`}
								size={48}
							/>
							<span className={styles.profileRole}>The Knight</span>
							<span
								className={styles.profileName}
								style={{ color: isVictory ? '#fbbf24' : '#d32f2f' }}
							>
								{knight.knightName}
							</span>
						</div>
					</div>

					<p
						className={styles.epitaph}
						style={{ borderTop: isVictory ? '1px solid #fbbf24' : '1px solid #333' }}
					>
						{fullTitle} {knight.patronGod !== 'None' ? `| Follower of ${knight.patronGod}` : ''}
					</p>
				</div>

				<div className={styles.modalBody}>
					{/* SECTION: The Story */}
					<h3 className={styles.sectionDivider}>THE CHRONICLE</h3>
					<p className={styles.storyText}>{generateStory(knight)}</p>

					{/* SECTION: Final Moments */}
					<h3 className={styles.sectionDivider}>{isVictory ? 'THE CROWNING MOMENT' : 'THE FINAL MOMENTS'}</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>{isVictory ? 'Date of Triumph' : 'Date of Fall'}</span>
						<span className={styles.statValue}>
							{knight.deathSeason}, Year {knight.deathYear}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Location</span>
						<span className={styles.statValue}>
							{knight.deathZone} <span style={{ color: '#888', fontSize: '0.85em' }}>({knight.deathRegion})</span>
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Fate</span>
						<span
							className={styles.statValue}
							style={{ color: isVictory ? '#fbbf24' : '#ff4d4d', fontWeight: 'bold' }}
						>
							{isVictory ? 'TRIUMPH & RETIREMENT' : knight.causeOfDeath.toUpperCase()}
						</span>
					</div>

					{knight.killerName !== 'None' && (
						<div className={styles.statRow}>
							<span className={styles.statLabel}>{isVictory ? 'Title Claimed' : 'Slain By'}</span>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
									<span
										className={styles.statValue}
										style={{ color: isVictory ? '#fbbf24' : getRankColor(knight.killerRank), fontWeight: 'bold', lineHeight: '1.2' }}
									>
										{knight.killerName}
									</span>
									{/* NEW: Display subclass/class below name if not victory */}
									{!isVictory && knight.killerCategory && knight.killerCategory !== 'None' && (
										<span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{killerSubtitle}</span>
									)}
								</div>
								{isVictory ? (
									<span style={{ fontSize: '1.5rem' }}>🏆</span>
								) : (
									<NpcAvatar
										src={finalKillerAvatar} // <-- USING THE DYNAMICALLY CALCULATED PATH HERE
										rank={knight.killerRank}
										size={40}
										onError={(e) => handleImgError(e, 'KILLER', knight.killerName)}
									/>
								)}
							</div>
						</div>
					)}

					{/* SECTION: Progression Stats */}
					<h3 className={styles.sectionDivider}>PROGRESSION</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>{isVictory ? 'Age at Retirement' : 'Age at Death'}</span>
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

					{/* SECTION: Inventory & Assets */}
					<h3 className={styles.sectionDivider}>LEGACY ASSETS</h3>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Currency</span>
						<span className={styles.statValue}>
							S: {knight.inventory?.silverCoins || 0} | G: {knight.inventory?.goldCoins || 0}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Trade Goods</span>
						<span className={styles.statValue}>
							TS: {knight.inventory?.tradeSilver || 0} | TG: {knight.inventory?.tradeGold || 0}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Consumables</span>
						<span className={styles.statValue}>
							Food: {knight.inventory?.food || 0} | Potions: {knight.inventory?.healingPotions || 0}
						</span>
					</div>
					<div className={styles.statRow}>
						<span className={styles.statLabel}>Logistics</span>
						<span className={styles.statValue}>
							{knight.inventory?.caravanSize || 0} Beasts | {knight.inventory?.backpackSize || 0} Items
						</span>
					</div>

					{/* FINAL SCORE */}
					<div
						className={styles.finalScoreRow}
						style={{ borderTop: isVictory ? '2px solid #fbbf24' : '2px solid #d32f2f' }}
					>
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

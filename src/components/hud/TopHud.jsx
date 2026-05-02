// File: Client/src/components/hud/TopHud.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
// IMPORTĂM NOUL FIȘIER CSS
import styles from '../../styles/TopHud.module.css';

const getSeasonString = (seasonKey) => {
	if (!seasonKey) return 'Unknown';
	return seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1);
};

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const getPlayerTitle = (rank, honor) => {
	const safeRank = Math.min(5, Math.max(1, rank || 1));
	const baseTitle = WORLD.SOCIAL?.rankTitles?.[safeRank] || 'Knight';

	if (honor >= WORLD.MORALITY.alignment.goodMin) {
		const prefix = WORLD.MORALITY.titles.good[safeRank];
		return `${prefix} ${baseTitle}`;
	} else if (honor <= WORLD.MORALITY.alignment.evilMax) {
		const prefix = WORLD.MORALITY.titles.evil[safeRank];
		return `${prefix} ${baseTitle}`;
	}

	return baseTitle;
};

const TopHud = ({ isStatsModalOpen, setIsStatsModalOpen }) => {
	const gameState = useGameState((state) => state.gameState);
	const knightName = useGameState((state) => state.knightName);

	const [isHudExpanded, setIsHudExpanded] = useState(false);

	if (!gameState || !gameState.player) return null;

	const time = gameState.time;
	const player = gameState.player;
	const inventory = player.inventory || {};
	const location = gameState.location;
	const seasonName = getSeasonString(time.activeSeason);
	const currentMonthName = MONTH_NAMES[time.currentMonth - 1] || 'Unknown';

	const currentNode = DB_LOCATIONS_ZONES.find(
		(node) => node.worldId === location.currentWorldId,
	);
	const zoneName = currentNode?.zoneName || 'Streets';
	const regionName = currentNode?.zoneClass || 'Unknown';
	const ecoLevel = currentNode?.zoneEconomyLevel || 1;
	const rer = location.regionalExchangeRate || 10;

	// --- HP CALCULATIONS ---
	const hardCap = WORLD.PLAYER.hpLimits.hardCap;
	const hpCurrent = player.biology.hpCurrent;
	const hpMax = player.biology.hpMax;
	const hpPct = Math.min(
		100,
		Math.max(0, Math.round((hpCurrent / hardCap) * 100)),
	);
	const woundPct = Math.min(
		100,
		Math.max(0, Math.round(((hardCap - hpMax) / hardCap) * 100)),
	);
	const emptyEndPct = 100 - woundPct;

	// --- AP CALCULATIONS ---
	const apCurrent = player.progression.actionPoints;
	const apMax = WORLD.PLAYER.maxAp || 8;

	// Helper folosind noile clase din CSS
	const renderApIcons = () => {
		const icons = [];
		for (let i = 0; i < apMax; i++) {
			let iconClass = styles.apIconEmpty; // Default Roșu

			if (i < apCurrent - apMax) {
				iconClass = styles.apIconOvercharge; // Verde
			} else if (i < apCurrent) {
				iconClass = styles.apIconStandard; // Albastru
			}

			icons.push(
				<span key={i} className={`${styles.apIcon} ${iconClass}`}>
					◈
				</span>,
			);
		}
		return icons;
	};

	const playerRank = player.identity?.rank || 1;
	const playerHonor = player.progression?.honor || 0;
	const computedTitle = getPlayerTitle(playerRank, playerHonor);

	return (
		<div className={styles.topSection}>
			<div className={styles.hudContainer}>
				{/* ROW 1: HP / Toggle Button / AP */}
				<div className={styles.hudRow} style={{ alignItems: 'stretch' }}>
					{/* BARA DE HP */}
					<div
						className={`${styles.statBox} ${styles.boxHalf} ${styles.resourceBox} ${styles.hpBarWrapper}`}
						style={{ backgroundColor: '#111' }}
					>
						<div className={styles.hpLinesContainer}>
							{Array.from({ length: 100 }).map((_, index) => {
								const isHp = index < hpPct;
								const isWound = index >= emptyEndPct;

								let lineClass = styles.hpLineEmpty;
								if (isWound) {
									lineClass = styles.hpLineWound;
								} else if (isHp) {
									lineClass = styles.hpLineActive;
								}

								// Pseudo-random deterministic delay formula based on index
								const calculatedDelay =
									(index % 13) * 0.15 + (index % 3) * 0.11;

								return (
									<div
										key={index}
										className={`${styles.hpLine} ${lineClass}`}
										style={{
											// Apply the negative delay to both active HP and Wound segments
											animationDelay:
												isHp || isWound
													? `-${calculatedDelay}s`
													: '0s',
										}}
									/>
								);
							})}
						</div>

						<span className={styles.bgWatermark} style={{ zIndex: 2 }}>
							HP
						</span>
						<span className={styles.statValue} style={{ zIndex: 2 }}>
							{hpCurrent} / {hpMax}
						</span>
					</div>

					<button
						className={styles.hudToggleBtn}
						onClick={() => setIsHudExpanded(!isHudExpanded)}
					>
						{isHudExpanded ? '▲' : '▼'}
					</button>

					{/* BARA DE AP */}
					<div
						className={`${styles.statBox} ${styles.boxHalf} ${styles.resourceBox}`}
						style={{ backgroundColor: '#111' }}
					>
						<span className={styles.bgWatermark}>AP</span>
						<div className={styles.apIconsWrapper}>{renderApIcons()}</div>
					</div>
				</div>

				{/* EXPANDABLE PANEL */}
				{isHudExpanded && (
					<div className={styles.expandedPanel}>
						<div className={styles.hudRow}>
							<div className={`${styles.statBox} ${styles.boxFull}`}>
								<span className={styles.statLabel}>Timeline</span>
								<span className={styles.statValueText}>
									Year {time.currentYear || 1} | Turn{' '}
									{time.currentTurn || 0} | {currentMonthName} |{' '}
									{seasonName}
								</span>
							</div>
						</div>
						<div className={styles.hudRow}>
							<div className={`${styles.statBox} ${styles.boxHalf}`}>
								<span className={styles.statLabel}>Region / Zone</span>
								<span className={styles.statValueText}>
									{regionName} | {zoneName.replace(/_/g, ' ')}
								</span>
							</div>
							<div className={`${styles.statBox} ${styles.boxHalf}`}>
								<span className={styles.statLabel}>Economy</span>
								<span className={styles.statValueText}>
									Level: {ecoLevel} | RER: {rer}
								</span>
							</div>
						</div>
						<div className={styles.hudRow}>
							<div className={`${styles.statBox} ${styles.boxThird}`}>
								<span className={styles.statLabel}>Potions</span>
								<span
									className={styles.statValueText}
									style={{ gap: '6px' }}
								>
									<span className={styles.healthIcon}>✚</span>
									<span>{inventory.healingPotions || 0}</span>
								</span>
							</div>
							<div className={`${styles.statBox} ${styles.boxThird}`}>
								<span className={styles.statLabel}>Silver</span>
								<span
									className={styles.statValueText}
									style={{ gap: '6px' }}
								>
									<span
										className={`${styles.ingotIcon} ${styles.ingotSilver}`}
									>
										S
									</span>
									<span>{inventory.tradeSilver || 0}</span>
								</span>
							</div>
							<div className={`${styles.statBox} ${styles.boxThird}`}>
								<span className={styles.statLabel}>Gold</span>
								<span
									className={styles.statValueText}
									style={{ gap: '6px' }}
								>
									<span
										className={`${styles.ingotIcon} ${styles.ingotGold}`}
									>
										G
									</span>
									<span>{inventory.tradeGold || 0}</span>
								</span>
							</div>
						</div>
					</div>
				)}

				{/* ROW 2: Food, Knight Name, Coins */}
				<div className={styles.hudRow}>
					<div className={`${styles.statBox} ${styles.boxSide}`}>
						<span className={styles.statLabel}>Food</span>
						<span className={styles.statValue}>
							<span className={styles.foodIcon}>🍞</span>{' '}
							{inventory.food || 0}
						</span>
					</div>

					<div
						className={`${styles.interactiveKnightBox} ${styles.boxCenter}`}
						onClick={() => setIsStatsModalOpen(!isStatsModalOpen)}
					>
						<span className={styles.statLabel}>
							Rank {playerRank} | {computedTitle}
						</span>
						<span className={styles.statValueName}>{knightName}</span>
					</div>

					<div className={`${styles.statBox} ${styles.boxSide}`}>
						<span className={styles.statLabel}>Coins</span>
						<span className={styles.statValue}>
							<span className={styles.coinIcon}>c</span>{' '}
							{inventory.silverCoins || 0}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopHud;

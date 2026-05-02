// File: Client/src/components/hud/TopHud.jsx
import { useState, useEffect, useRef } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
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

	// Unified State Tracking Variables
	const [hpAnimState, setHpAnimState] = useState(null);
	const prevHpRef = useRef(0);

	const [animatingApIndices, setAnimatingApIndices] = useState([]);
	const [apGlobalAnimState, setApGlobalAnimState] = useState(null);
	const prevApRef = useRef(0);

	const [foodAnimState, setFoodAnimState] = useState(null);
	const prevFoodRef = useRef(0);

	const [coinAnimState, setCoinAnimState] = useState(null);
	const prevCoinsRef = useRef(0);

	// Effect: HP Tracking
	useEffect(() => {
		if (gameState && gameState.player) {
			const currentHp = gameState.player.biology.hpCurrent;
			if (prevHpRef.current === 0 && currentHp > 0 && hpAnimState === null) {
				prevHpRef.current = currentHp;
				return;
			}
			if (prevHpRef.current !== currentHp) {
				setHpAnimState(
					currentHp > prevHpRef.current ? 'increase' : 'decrease',
				);
				prevHpRef.current = currentHp;
				const timer = setTimeout(() => setHpAnimState(null), 2000);
				return () => clearTimeout(timer);
			}
		}
	}, [gameState?.player?.biology?.hpCurrent]);

	// Effect: AP Tracking (Indices and Global Watermark)
	useEffect(() => {
		if (gameState && gameState.player) {
			const apCurrent = gameState.player.progression.actionPoints;
			if (prevApRef.current !== apCurrent) {
				const changedIndices = [];
				const minIndex = Math.min(prevApRef.current, apCurrent);
				const maxIndex = Math.max(prevApRef.current, apCurrent);

				for (let i = minIndex; i < maxIndex; i++) {
					changedIndices.push(i);
				}

				setAnimatingApIndices(changedIndices);
				setApGlobalAnimState(
					apCurrent > prevApRef.current ? 'increase' : 'decrease',
				);
				prevApRef.current = apCurrent;

				const indexTimer = setTimeout(() => setAnimatingApIndices([]), 600);
				const globalTimer = setTimeout(
					() => setApGlobalAnimState(null),
					2000,
				);

				return () => {
					clearTimeout(indexTimer);
					clearTimeout(globalTimer);
				};
			}
		}
	}, [gameState?.player?.progression?.actionPoints]);

	// Effect: Food Tracking
	useEffect(() => {
		if (gameState && gameState.player) {
			const currentFood = gameState.player.inventory.food || 0;
			if (
				prevFoodRef.current === 0 &&
				currentFood > 0 &&
				foodAnimState === null
			) {
				prevFoodRef.current = currentFood;
				return;
			}
			if (prevFoodRef.current !== currentFood) {
				setFoodAnimState(
					currentFood > prevFoodRef.current ? 'increase' : 'decrease',
				);
				prevFoodRef.current = currentFood;
				const timer = setTimeout(() => setFoodAnimState(null), 2000);
				return () => clearTimeout(timer);
			}
		}
	}, [gameState?.player?.inventory?.food]);

	// Effect: Coin Tracking
	useEffect(() => {
		if (gameState && gameState.player) {
			const currentCoins = gameState.player.inventory.silverCoins || 0;
			if (
				prevCoinsRef.current === 0 &&
				currentCoins > 0 &&
				coinAnimState === null
			) {
				prevCoinsRef.current = currentCoins;
				return;
			}
			if (prevCoinsRef.current !== currentCoins) {
				setCoinAnimState(
					currentCoins > prevCoinsRef.current ? 'increase' : 'decrease',
				);
				prevCoinsRef.current = currentCoins;
				const timer = setTimeout(() => setCoinAnimState(null), 2000);
				return () => clearTimeout(timer);
			}
		}
	}, [gameState?.player?.inventory?.silverCoins]);

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

	// HP Calculations
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

	// AP Calculations
	const apCurrent = player.progression.actionPoints;
	const apMax = WORLD.PLAYER.maxAp || 8;

	const renderApIcons = () => {
		const icons = [];
		for (let i = 0; i < apMax; i++) {
			let iconClass = styles.apIconEmpty;

			if (i < apCurrent - apMax) {
				iconClass = styles.apIconOvercharge;
			} else if (i < apCurrent) {
				iconClass = styles.apIconStandard;
			}

			const isAnimating = animatingApIndices.includes(i);
			const animationClass = isAnimating ? styles.apIconAnimating : '';

			icons.push(
				<span
					key={i}
					className={`${styles.apIcon} ${iconClass} ${animationClass}`}
				>
					◈
				</span>,
			);
		}
		return icons;
	};

	const playerRank = player.identity?.rank || 1;
	const playerHonor = player.progression?.honor || 0;
	const computedTitle = getPlayerTitle(playerRank, playerHonor);

	// CSS Class Modifiers Assignment
	const getModifierClass = (state, increaseClass, decreaseClass) => {
		if (state === 'increase') return increaseClass;
		if (state === 'decrease') return decreaseClass;
		return '';
	};

	const hpWatermarkClass = getModifierClass(
		hpAnimState,
		styles.watermarkIncrease,
		styles.watermarkDecrease,
	);
	const apWatermarkClass = getModifierClass(
		apGlobalAnimState,
		styles.watermarkIncrease,
		styles.watermarkDecrease,
	);
	const foodClassModifier = getModifierClass(
		foodAnimState,
		styles.foodIconIncrease,
		styles.foodIconDecrease,
	);
	const coinClassModifier = getModifierClass(
		coinAnimState,
		styles.coinIconIncrease,
		styles.coinIconDecrease,
	);

	return (
		<div className={styles.topSection}>
			<div className={styles.hudContainer}>
				{/* ROW 1: HP / Toggle Button / AP */}
				<div className={styles.hudRow} style={{ alignItems: 'stretch' }}>
					{/* HP BAR */}
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

								const calculatedDelay =
									(index % 7) * 0.15 + (index % 3) * 0.11;

								return (
									<div
										key={index}
										className={`${styles.hpLine} ${lineClass}`}
										style={{
											animationDelay:
												isHp || isWound
													? `-${calculatedDelay}s`
													: '0s',
										}}
									/>
								);
							})}
						</div>

						<span
							className={`${styles.bgWatermark} ${hpWatermarkClass}`}
							style={{ zIndex: 2 }}
						>
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

					{/* AP BAR */}
					<div
						className={`${styles.statBox} ${styles.boxHalf} ${styles.resourceBox}`}
						style={{ backgroundColor: '#111' }}
					>
						<span className={`${styles.bgWatermark} ${apWatermarkClass}`}>
							AP
						</span>
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
							<span
								className={`${styles.foodIcon} ${foodClassModifier}`}
							>
								🍞
							</span>{' '}
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
							<span
								className={`${styles.coinIcon} ${coinClassModifier}`}
							>
								c
							</span>{' '}
							{inventory.silverCoins || 0}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopHud;

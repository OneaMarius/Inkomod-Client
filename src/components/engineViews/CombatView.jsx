// File: Client/src/components/engineViews/CombatView.jsx
import { useEffect, useRef } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import styles from '../../styles/CombatView.module.css';
import { WORLD } from '../../data/GameWorld.js';

// Importing placeholder assets
import playerImg from '../../assets/player.png';
import npcImg from '../../assets/npc.png';

const CombatView = () => {
	// Extract required state from the global store
	const player = useGameState((state) => state.gameState.player);
	const knightName = useGameState((state) => state.knightName);
	const location = useGameState((state) => state.gameState.location);
	const enemy = useGameState((state) => state.activeCombatEnemy);
	const activeCombatType = useGameState((state) => state.activeCombatType);
	const logMessages = useGameState((state) => state.combatLogMessages);
	const roundStatus = useGameState((state) => state.combatRoundStatus);
	const permittedActions = useGameState((state) => state.playerActionsPermitted);

	// Extract dispatcher functions
	const executeCombatRound = useGameState((state) => state.executeCombatRound);
	const exitCombatEncounterView = useGameState((state) => state.exitCombatEncounterView);

	// Reference for auto-scrolling the battle log
	const logEndRef = useRef(null);

	// Auto-scroll to bottom whenever a new log message is added
	useEffect(() => {
		if (logEndRef.current) {
			logEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [logMessages]);

	// Guard clause for missing state
	if (!player || !enemy) {
		return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>ERROR: Combat data missing.</div>;
	}

	// --- HP CALCULATIONS ---
	const hardCap = WORLD.PLAYER.hpLimits.hardCap; // Usually 100

	// Calculate percentage of current HP relative to the absolute maximum
	const playerHpPercent = Math.max(0, (player.biology.hpCurrent / hardCap) * 100);

	// Calculate percentage of permanently lost HP (Wound) relative to the absolute maximum
	const playerWoundPercent = Math.max(0, ((hardCap - player.biology.hpMax) / hardCap) * 100);

	// Enemies do not have persistent wounds between encounters, so they scale to their own max
	const enemyHpPercent = Math.max(0, (enemy.biology.hpCurrent / enemy.biology.hpMax) * 100);

	// Format Combat Type for Display
	let readableCombatType = 'Standard Combat';
	if (activeCombatType === 'FF') readableCombatType = 'Friendly Duel';
	if (activeCombatType === 'DMF') readableCombatType = 'Deathmatch';

	// Format Zone Name for Display
	const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
	const zoneName = currentNode?.zoneName ? currentNode.zoneName.replace(/_/g, ' ') : 'Unknown Region';

	// Resolution Modal processing
	const isCombatFinished = roundStatus !== 'CONTINUE';
	let modalTitle = 'Combat Finished';
	let titleClass = styles.drawText;

	if (roundStatus.includes('WIN')) {
		modalTitle = 'Victory';
		titleClass = styles.winText;
	} else if (roundStatus.includes('LOSE')) {
		modalTitle = 'Defeat';
		titleClass = styles.loseText;
	}

	return (
		<div className={styles.combatContainer}>
			{/* 1. HUD TOP SECTION */}
			<div className={styles.hudTop}>
				<div className={styles.portraitBox}>
					<img
						src={playerImg}
						alt='Player'
						className={styles.portraitImg}
					/>
					{/* Render actual knight name, spanning up to 2 lines safely */}
					<span className={styles.entityName}>{knightName || player.name || 'Unknown Knight'}</span>
					<div className={styles.hpBarContainer}>
						<div
							className={styles.hpBarFill}
							style={{ width: `${playerHpPercent}%` }}
						></div>
						{/* Render the Wound bar if permanent damage exists */}
						{playerWoundPercent > 0 && (
							<div
								className={styles.hpBarWound}
								style={{ width: `${playerWoundPercent}%` }}
							></div>
						)}
						<span className={styles.hpBarText}>
							{player.biology.hpCurrent} / {player.biology.hpMax}
						</span>
					</div>
				</div>

				<div className={styles.vsIcon}>
					<span>⚔️</span>
				</div>

				<div className={styles.portraitBox}>
					<img
						src={npcImg}
						alt='Enemy'
						className={styles.portraitImg}
					/>
					{/* Render full enemy name, spanning up to 2 lines safely */}
					<span className={styles.entityName}>{enemy.entityName || enemy.name || 'Unknown Enemy'}</span>
					<div className={styles.hpBarContainer}>
						<div
							className={styles.hpBarFill}
							style={{ width: `${enemyHpPercent}%` }}
						></div>
						<span className={styles.hpBarText}>
							{enemy.biology.hpCurrent} / {enemy.biology.hpMax}
						</span>
					</div>
				</div>
			</div>

			{/* 2. INFO BANNER */}
			<div className={styles.infoBanner}>
				<span>
					Rule: <span className={styles.highlightText}>{readableCombatType}</span>
				</span>
				<span>
					Zone: <span className={styles.highlightText}>{zoneName}</span>
				</span>
			</div>

			{/* 3. BATTLE LOG MIDDLE SECTION */}
			<div className={styles.logMiddle}>
				{logMessages.map((msg, index) => (
					<p
						key={index}
						className={styles.logEntry}
					>
						{msg}
					</p>
				))}
				<div ref={logEndRef} />
			</div>

			{/* 4. ACTION BUTTONS BOTTOM SECTION */}
			<div className={styles.actionsBottom}>
				<button
					className={styles.actionBtn}
					onClick={() => executeCombatRound('FIGHT')}
					disabled={isCombatFinished || !permittedActions.canFight}
				>
					FIGHT
				</button>
				<button
					className={styles.actionBtn}
					onClick={() => executeCombatRound('HEAL')}
					disabled={isCombatFinished || !permittedActions.canHeal}
				>
					HEAL
				</button>
				<button
					className={styles.actionBtn}
					onClick={() => executeCombatRound('SURRENDER')}
					disabled={isCombatFinished || !permittedActions.canSurrender}
				>
					SURRENDER
				</button>
				<button
					className={styles.actionBtn}
					onClick={() => executeCombatRound('FLEE')}
					disabled={isCombatFinished || !permittedActions.canFlee}
				>
					FLEE
				</button>
			</div>

			{/* 5. RESOLUTION OVERLAY */}
			{isCombatFinished && (
				<div className={styles.resolutionOverlay}>
					<div className={styles.resolutionModal}>
						<h2 className={`${styles.resolutionTitle} ${titleClass}`}>{modalTitle}</h2>
						<p style={{ color: '#ccc', marginBottom: '20px' }}>Outcome: {roundStatus.replace('_', ' ')}</p>
						<button
							className={styles.exitBtn}
							onClick={exitCombatEncounterView}
						>
							Exit Combat
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CombatView;

// File: Client/src/components/engineViews/CombatView.jsx
import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { WORLD } from '../../data/GameWorld.js';
import { calculateHitProbabilities } from '../../engine/ENGINE_Combat_Math.js';

import CombatHudTop from '../combat/CombatHudTop';
import CombatResolutionModal from '../combat/CombatResolutionModal';
import CombatStatsModal from '../combat/CombatStatsModal';

import styles from '../../styles/CombatView.module.css';

const CombatView = () => {
	const player = useGameState((state) => state.gameState.player);
	const knightName = useGameState((state) => state.knightName);
	const location = useGameState((state) => state.gameState.location);
	const enemy = useGameState((state) => state.activeCombatEnemy);
	const activeCombatType = useGameState((state) => state.activeCombatType);
	const logMessages = useGameState((state) => state.combatLogMessages);
	const roundStatus = useGameState((state) => state.combatRoundStatus);
	const permittedActions = useGameState((state) => state.playerActionsPermitted);
	const lastRoundVisualEvents = useGameState((state) => state.lastRoundVisualEvents);
	const playerCombatStance = useGameState((state) => state.playerCombatStance);
	const setCombatStance = useGameState((state) => state.setCombatStance);
	const executeCombatRound = useGameState((state) => state.executeCombatRound);
	const exitCombatEncounterView = useGameState((state) => state.exitCombatEncounterView);

	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
	const logContainerRef = useRef(null);

	useEffect(() => {
		if (logContainerRef.current) {
			logContainerRef.current.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
		}
	}, [logMessages]);

	useEffect(() => {
		window.scrollTo(0, 0);
		return () => window.scrollTo(0, 0);
	}, []);

	const isCombatFinished = roundStatus !== 'CONTINUE';

	// Safely determine enemy traits, defaulting safely if enemy is null (e.g., player died)
	const isEnemyCreature = enemy?.classification?.entityCategory === 'Animal' || enemy?.classification?.entityCategory === 'Monster';
	const npcCombatStance = 'BALANCED';

	// Calculate probabilities as standard variables (avoids Hook Rule violations)
	const playerHitChances =
		!isCombatFinished && player && enemy
			? calculateHitProbabilities(player, enemy, WORLD.COMBAT, playerCombatStance, npcCombatStance, isEnemyCreature)
			: null;

	const npcHitChances =
		!isCombatFinished && player && enemy ? calculateHitProbabilities(enemy, player, WORLD.COMBAT, npcCombatStance, playerCombatStance, false) : null;

	if (!player || !enemy) {
		return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>ERROR: Combat data missing.</div>;
	}

	const hardCap = WORLD.PLAYER.hpLimits.hardCap;
	const playerHpPercent = Math.max(0, (player.biology.hpCurrent / hardCap) * 100);
	const playerWoundPercent = Math.max(0, ((hardCap - player.biology.hpMax) / hardCap) * 100);
	const enemyHpPercent = Math.max(0, (enemy.biology.hpCurrent / enemy.biology.hpMax) * 100);

	let readableCombatType = 'Standard Combat';
	if (activeCombatType === 'FF') readableCombatType = 'Friendly Duel';
	if (activeCombatType === 'DMF') readableCombatType = 'Deathmatch';

	const emptyBreakdown = {
		equipAd: 0,
		attrAd: 0,
		totalAd: 0,
		equipDr: 0,
		attrDr: 0,
		totalDr: 0,
		equippedRanks: { weapon: '-', armour: '-', shield: '-', helmet: '-' },
	};
	const pData = player.combatBreakdown || emptyBreakdown;
	const nData = enemy.combatBreakdown || emptyBreakdown;

	const playerRank = player.identity?.rank || '?';
	const enemyRank = enemy.classification?.entityRank || enemy.classification?.poiRank || '?';

	const getLogClass = (msg) => {
		if (typeof msg !== 'string') return styles.logNeutral;
		if (msg.includes('You strike') || msg.includes('successfully') || msg.includes('Healing Potion')) return styles.logPlayerGood;
		if (msg.includes('Opponent strikes') || msg.includes('failed!')) return styles.logPlayerBad;
		return styles.logNeutral;
	};

	return (
		<div className={styles.combatContainer}>
			<CombatHudTop
				player={player}
				knightName={knightName}
				enemy={enemy}
				playerHpPercent={playerHpPercent}
				playerWoundPercent={playerWoundPercent}
				enemyHpPercent={enemyHpPercent}
				setIsInfoModalOpen={setIsInfoModalOpen}
				visualEvents={lastRoundVisualEvents}
				readableCombatType={readableCombatType} // Passed to HUD Top
			/>

			{/* NPC PROBABILITY BANNER */}
			{npcHitChances && !isCombatFinished && (
				<div
					style={{
						fontSize: '0.75rem',
						padding: '6px 10px',
						backgroundColor: '#111',
						borderBottom: '1px solid #333',
						fontFamily: 'monospace',
						color: '#aaa',
					}}
				>
					<div style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px', letterSpacing: '1px' }}>NPC ({npcCombatStance})</div>
					<div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
						<span style={{ color: '#4caf50' }}>HIT: {npcHitChances.clean}%</span>
						<span style={{ color: '#ff9800' }}>CRIT: {npcHitChances.critical}%</span>
						<span style={{ color: '#2196f3' }}>BLK: {playerHitChances.block}%</span>
						<span style={{ color: '#9c27b0' }}>PRY: {playerHitChances.parry}%</span>
						<span style={{ color: '#f44336' }}>EVD: {playerHitChances.evade}%</span>
					</div>
				</div>
			)}

			<div
				className={styles.logMiddle}
				ref={logContainerRef}
			>
				{logMessages.map((msg, index) => (
					<p
						key={index}
						className={`${styles.logEntry} ${getLogClass(msg)}`}
					>
						{msg}
					</p>
				))}
			</div>

			<div className={styles.combatControlsWrapper}>
				{/* PLAYER PROBABILITY PREVIEW BANNER */}
				{playerHitChances && !isCombatFinished && (
					<div
						style={{
							fontSize: '0.75rem',
							padding: '6px 10px',
							backgroundColor: '#111',
							borderTop: '1px solid #333',
							borderBottom: '1px solid #333',
							marginBottom: '10px',
							fontFamily: 'monospace',
							color: '#aaa',
						}}
					>
						<div style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px', letterSpacing: '1px' }}>
							YOU ({playerCombatStance})
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
							<span style={{ color: '#4caf50' }}>HIT: {playerHitChances.clean}%</span>
							<span style={{ color: '#ff9800' }}>CRIT: {playerHitChances.critical}%</span>
							<span style={{ color: '#2196f3' }}>BLK: {npcHitChances.block}%</span>
							<span style={{ color: '#9c27b0' }}>PRY: {npcHitChances.parry}%</span>
							<span style={{ color: '#f44336' }}>EVD: {npcHitChances.evade}%</span>
						</div>
					</div>
				)}

				{/* STANCE ROW */}
				<div className={styles.stanceRow}>
					{['AGGRESSIVE', 'BALANCED', 'DEFENSIVE'].map((stance) => {
						const icon = stance === 'AGGRESSIVE' ? '🗡️' : stance === 'DEFENSIVE' ? '🛡️' : '⚖️';
						return (
							<button
								key={stance}
								className={`${styles.stanceBtn} ${playerCombatStance === stance ? styles.stanceBtnActive : ''}`}
								onClick={() => setCombatStance(stance)}
								disabled={isCombatFinished}
							>
								<span className={styles.stanceBgIcon}>{icon}</span>
								<span className={styles.stanceText}>{stance}</span>
							</button>
						);
					})}
				</div>

				{/* MAIN ACTIONS */}
				<div className={styles.actionsBottom}>
					<button
						className={styles.actionBtn}
						onClick={() => executeCombatRound('FIGHT')}
						disabled={isCombatFinished || !permittedActions.canFight}
					>
						ATTACK
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
			</div>

			{isCombatFinished && (
				<CombatResolutionModal
					player={player}
					knightName={knightName}
					enemy={enemy}
					roundStatus={roundStatus}
					exitCombatEncounterView={exitCombatEncounterView}
				/>
			)}

			{isInfoModalOpen && (
				<CombatStatsModal
					player={player}
					knightName={knightName}
					enemy={enemy}
					pData={pData}
					nData={nData}
					playerRank={playerRank}
					enemyRank={enemyRank}
					setIsInfoModalOpen={setIsInfoModalOpen}
				/>
			)}
		</div>
	);
};

export default CombatView;

// File: Client/src/components/engineViews/CombatView.jsx
import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { WORLD } from '../../data/GameWorld.js';

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

	const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
	const zoneName = currentNode?.zoneName ? currentNode.zoneName.replace(/_/g, ' ') : 'Unknown Region';

	const isCombatFinished = roundStatus !== 'CONTINUE';

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

	const playerRank = player.progression?.level || 'P';
	const enemyRank = enemy.classification?.entityRank || enemy.classification?.poiRank || '?';

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
			/>

			<div className={styles.infoBanner}>
				<span>
					Rule: <span className={styles.highlightText}>{readableCombatType}</span>
				</span>
				<span>
					Zone: <span className={styles.highlightText}>{zoneName}</span>
				</span>
			</div>

			<div
				className={styles.logMiddle}
				ref={logContainerRef}
			>
				{logMessages.map((msg, index) => (
					<p
						key={index}
						className={styles.logEntry}
					>
						{msg}
					</p>
				))}
			</div>

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

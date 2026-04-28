// File: Client/src/components/engineViews/CombatView.jsx
import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { WORLD } from '../../data/GameWorld.js';
import { calculateHitProbabilities } from '../../engine/ENGINE_Combat_Math.js';

import CombatHudTop from '../combat/CombatHudTop';
import CombatResolutionModal from '../combat/CombatResolutionModal';
import CombatStatsModal from '../combat/CombatStatsModal';
import VideoTransition from '../VideoTransition';

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

	const [showTransition, setShowTransition] = useState(true);
	const [visualProfile, setVisualProfile] = useState(null);

	// --- NOU: Stări pentru controlul modalelor de la finalul luptei ---
	const [showPreModal, setShowPreModal] = useState(false);
	const [showFinalModal, setShowFinalModal] = useState(false);

	useEffect(() => {
		try {
			const storedUser = JSON.parse(localStorage.getItem('user'));
			if (storedUser && storedUser.visualProfile) {
				setVisualProfile(storedUser.visualProfile);
			}
		} catch (error) {
			console.error('Failed to parse user profile from local storage', error);
		}
	}, []);

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

	// --- NOU: Sincronizarea modalelor cu sfârșitul animațiilor ---
	useEffect(() => {
		if (isCombatFinished) {
			// Așteptăm 1.5 secunde pentru ca CombatHudTop să își termine animațiile (1500ms cleanup timer)
			const delayTimer = setTimeout(() => {
				setShowPreModal(true);
			}, 2500);

			return () => clearTimeout(delayTimer);
		} else {
			// Resetăm stările dacă începe o luptă nouă
			setShowPreModal(false);
			setShowFinalModal(false);
		}
	}, [isCombatFinished]);

	const handleTransitionPoint = () => {
		setShowTransition(false);
	};

	// Funcția apelată când jucătorul dă click pe "SEE RESULTS"
	const handleSeeResults = () => {
		setShowPreModal(false);
		setShowFinalModal(true);
	};

	const isEnemyCreature = enemy?.classification?.entityCategory === 'Animal' || enemy?.classification?.entityCategory === 'Monster';
	const npcCombatStance = 'BALANCED';

	const playerHitChances =
		!isCombatFinished && player && enemy
			? calculateHitProbabilities(player, enemy, WORLD.COMBAT, playerCombatStance, npcCombatStance, isEnemyCreature)
			: null;

	const npcHitChances =
		!isCombatFinished && player && enemy ? calculateHitProbabilities(enemy, player, WORLD.COMBAT, npcCombatStance, playerCombatStance, false) : null;

	// ========================================================================
	// FAILSAFE: PREVENIRE SOFT-LOCK ÎN CAZ DE EROARE GENERARE ENTITATE
	// ========================================================================
	if (!player || !enemy) {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100vh',
					backgroundColor: '#111',
					color: '#ef4444',
					padding: '20px',
					textAlign: 'center',
				}}
			>
				<h2 style={{ fontFamily: '"VT323", monospace', fontSize: '2.5rem', marginBottom: '10px' }}>⚠️ ENCOUNTER DATA CORRUPTED</h2>
				<p style={{ color: '#aaa', marginBottom: '30px', maxWidth: '600px' }}>
					The engine failed to generate the enemy entity for this encounter. The error has been logged to the console. Press the button below to abort this
					encounter and safely return to the region view.
				</p>
				<button
					onClick={() => {
						// Resetăm starea jocului pentru a ieși din luptă în siguranță
						if (exitCombatEncounterView) {
							exitCombatEncounterView();
						} else {
							// Fallback extrem în caz că funcția nu e încărcată
							window.location.reload();
						}
					}}
					style={{
						padding: '12px 30px',
						backgroundColor: '#ef4444',
						color: '#fff',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontFamily: '"VT323", monospace',
						fontSize: '1.5rem',
						letterSpacing: '1px',
					}}
				>
					ABORT ENCOUNTER & RETURN
				</button>
			</div>
		);
	}

	const hardCap = WORLD.PLAYER.hpLimits.hardCap;
	const playerHpPercent = Math.max(0, (player.biology.hpCurrent / hardCap) * 100);
	const playerWoundPercent = Math.max(0, ((hardCap - player.biology.hpMax) / hardCap) * 100);
	const enemyHpPercent = Math.max(0, (enemy.biology.hpCurrent / enemy.biology.hpMax) * 100);

	let readableCombatType = 'Normal Fight';
	if (activeCombatType === 'FF') readableCombatType = 'Friendly Fight';
	if (activeCombatType === 'DMF') readableCombatType = 'Deathmatch';

	const emptyBreakdown = {
		equipAd: 0,
		attrAd: 0,
		totalAd: 0,
		equipDr: 0,
		attrDr: 0,
		totalDr: 0,
		equippedRanks: { weapon: '-', armor: '-', shield: '-', helmet: '-' },
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
		<>
			{showTransition && (
				<VideoTransition
					onTransitionPoint={handleTransitionPoint}
					videoSrc='/assets/videos/inkomod-transition3.mp4'
				/>
			)}

			<div
				className={styles.combatContainer}
				style={{ visibility: showTransition ? 'hidden' : 'visible' }}
			>
				<CombatHudTop
					player={player}
					knightName={knightName}
					enemy={enemy}
					playerHpPercent={playerHpPercent}
					playerWoundPercent={playerWoundPercent}
					enemyHpPercent={enemyHpPercent}
					setIsInfoModalOpen={setIsInfoModalOpen}
					visualEvents={lastRoundVisualEvents}
					readableCombatType={readableCombatType}
					visualProfile={visualProfile}
				/>

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
						<div style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px', letterSpacing: '1px' }}>
							NPC ({npcCombatStance})
						</div>
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

				{/* --- NOU: PRE-MODAL "FIGHT ENDED" --- */}
				{showPreModal && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0, 0, 0, 0.85)',
							zIndex: 1000,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
						}}
					>
						<div
							style={{
								backgroundColor: '#111',
								border: '2px solid var(--gold-primary)',
								padding: '40px',
								borderRadius: '8px',
								textAlign: 'center',
								minWidth: '320px',
								boxShadow: '0 4px 30px rgba(0,0,0,0.9)',
							}}
						>
							<h2
								style={{
									color: '#fff',
									marginBottom: '30px',
									fontFamily: '"VT323", monospace',
									fontSize: '2.5rem',
									letterSpacing: '2px',
									textTransform: 'uppercase',
								}}
							>
								Fight Ended
							</h2>
							<button
								className={styles.actionBtn}
								style={{ padding: '12px 40px', fontSize: '1.2rem', margin: '0 auto', display: 'block' }}
								onClick={handleSeeResults}
							>
								SEE RESULTS
							</button>
						</div>
					</div>
				)}

				{/* MODALUL FINAL DE REZOLUȚIE --- Randat doar după ce se dă click --- */}
				{showFinalModal && (
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
		</>
	);
};

export default CombatView;

// File: Client/src/components/engineViews/GameViewport.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import {
	DB_LOCATIONS_POIS_Civilized,
	DB_LOCATIONS_POIS_Untamed,
} from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import Button from '../Button';
import NpcInfo from '../NpcInfo';
import styles from '../../styles/GameViewport.module.css';
import InstantActionView from './InstantActionView';
import { WORLD } from '../../data/GameWorld';
import { calculateDangerLevel } from '../../utils/eventProbability';
import { formatForUI } from '../../utils/NameFormatter.js';
import POIActions from './POIActions';

const GameViewport = ({ onExploreComplete }) => {
	const location = useGameState((state) => state.gameState?.location);
	const activeEntities = useGameState(
		(state) => state.gameState?.activeEntities || [],
	);
	const playerAp = useGameState(
		(state) => state.gameState?.player?.progression?.actionPoints || 0,
	);
	const [pendingInstantAction, setPendingInstantAction] = useState(null);

	const startCombatEncounter = useGameState(
		(state) => state.startCombatEncounter,
	);
	const enterPoi = useGameState((state) => state.enterPoi);
	const exploreUntamed = useGameState((state) => state.exploreUntamed);
	const doHunt = useGameState((state) => state.doHunt);
	const doInteraction = useGameState((state) => state.doInteraction);
	const ensureCivilizedPois = useGameState(
		(state) => state.ensureCivilizedPois,
	);

	const dismissActiveEntity = useGameState(
		(state) => state.dismissActiveEntity,
	);
	const activeTargetId = useGameState(
		(state) => state.gameState?.activeTargetId,
	);
	const currentView = useGameState((state) => state.gameState?.currentView);
	const activeSeason = useGameState(
		(state) => state.gameState?.time?.activeSeason || 'spring',
	);

	const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);
	const [showCriminal, setShowCriminal] = useState(false);
	const [showTheft, setShowTheft] = useState(false);
	const [showChallenge, setShowChallenge] = useState(false);

	const currentNode = DB_LOCATIONS_ZONES.find(
		(node) => node.worldId === location?.currentWorldId,
	);
	const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

	useEffect(() => {
		if (
			isCivilizedZone &&
			(!location.availableCivilizedPois ||
				location.availableCivilizedPois.length === 0)
		) {
			ensureCivilizedPois();
		}
	}, [isCivilizedZone, location?.availableCivilizedPois, ensureCivilizedPois]);

	useEffect(() => {
		if (
			currentView === 'VIEWPORT' &&
			activeTargetId &&
			activeEntities.length > 0
		) {
			const target = activeEntities.find(
				(e) => (e.entityId || e.id) === activeTargetId,
			);

			if (target && !selectedInteractNpc) {
				setSelectedInteractNpc(target);
				setShowCriminal(false);
				setShowTheft(false);
				setShowChallenge(false);

				setTimeout(() => {
					useGameState.setState((state) => ({
						gameState: { ...state.gameState, activeTargetId: null },
					}));
				}, 100);
			}
		}
	}, [currentView, activeTargetId, activeEntities, selectedInteractNpc]);

	if (!location || !location.currentWorldId)
		return <div>Loading Viewport...</div>;

	const zoneName = currentNode?.zoneName || location.currentWorldId;
	const region = currentNode?.zoneClass || 'Unknown';
	const economy = currentNode?.zoneEconomyLevel || 1;
	const exchangeRate = location.regionalExchangeRate || 10;
	// Calculate the danger percentage
	const dangerPct = Math.round(
		calculateDangerLevel(location.currentWorldId, activeSeason),
	);

	// Helper to determine text color based on danger percentage
	const getDangerColor = (pct) => {
		if (pct < 25) return '#22c55e'; // Green
		if (pct < 50) return '#3b82f6'; // Blue
		if (pct < 75) return '#f97316'; // Orange
		return '#ef4444'; // Red
	};

	const handleExploreClick = () => {
		const result = exploreUntamed();
		if (result && result.status === 'SUCCESS' && onExploreComplete) {
			onExploreComplete(result);
		}
	};

	const handleHuntClick = () => {
		const result = doHunt();
		if (result && result.status === 'SUCCESS' && onExploreComplete) {
			onExploreComplete(result);
		}
	};

	const handleActionClick = (tag, targetId) => {
		const actionDef = DB_INTERACTION_ACTIONS[tag];
		const regionalExchangeRate = location.regionalExchangeRate || 10;

		if (tag === 'Hunt_Animal') {
			doInteraction(tag, targetId, regionalExchangeRate);
			setSelectedInteractNpc(null);
			return;
		}

		if (
			actionDef &&
			(actionDef.executionRoute === 'ROUTE_INSTANT' ||
				actionDef.executionRoute === 'ROUTE_COMBAT')
		) {
			setPendingInstantAction({ tag, target: selectedInteractNpc });
			setSelectedInteractNpc(null);
		} else {
			doInteraction(tag, targetId, regionalExchangeRate);
			setSelectedInteractNpc(null);
		}
	};

	// ========================================================================
	// HELPER: RENDER NPC CARDS
	// ========================================================================
	const renderNpcGrid = () => (
		<div className={styles.gridNpc} style={{ marginBottom: '20px' }}>
			{activeEntities.map((npc, index) => {
				const npcRank =
					npc.classification?.entityRank ||
					npc.classification?.poiRank ||
					'?';
				return (
					<div
						key={npc.entityId || npc.id || index}
						className={styles.npcCard}
					>
						<div className={styles.npcHeader}>
							<strong className={styles.npcName}>
								{npc.entityName || npc.name || 'Unknown Entity'}
							</strong>
							<div className={styles.npcMetaRight}>
								<div
									className='badgeContainer'
									style={{ margin: '0 10px', flexShrink: 0 }}
								>
									<div
										className='badgeCircle badgeRank'
										title='Entity Rank'
									>
										R{npcRank}
									</div>
									{npc.classification?.entityQuality && (
										<div
											className={`badgeCircle badgeQ${npc.classification.entityQuality}`}
											title='Entity Quality'
										>
											Q{npc.classification.entityQuality}
										</div>
									)}
								</div>
								<span className={styles.npcSubclass}>
									{npc.classification?.entitySubclass ||
										npc.title ||
										'Unknown'}
								</span>
							</div>
						</div>
						<div className={styles.cardActions}>
							<NpcInfo npc={npc} />
							<button
								className={styles.btnInteract}
								onClick={() => {
									setSelectedInteractNpc(npc);
									setShowCriminal(false);
									setShowTheft(false);
									setShowChallenge(false);
								}}
							>
								Interact
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);

	// ========================================================================
	// HELPER: RENDER INTERACTION MODAL
	// ========================================================================
	const renderInteractionModal = () => {
		if (!selectedInteractNpc) return null;

		const criminalTagsDef = [
			'Combat_Engage',
			'Target_Ambush',
			'Target_Assassination',
		];
		const theftTagsDef = [
			'Target_Robbery',
			'Target_Steal_Coin',
			'Target_Steal_Food',
		];
		const challengeTagsDef = [
			'Combat_Training',
			'Combat_Duel',
			'Combat_Brawl',
		];

		const allTags = selectedInteractNpc.interactions?.actionTags || [];

		// --- LOGICĂ DE PRIORITIZARE PENTRU ORDINEA PERSONALIZATĂ ---
		const getSortPriority = (tag) => {
			if (tag.startsWith('Labor_')) return 10;
			if (tag.startsWith('Heal_') || tag.startsWith('Cure_')) return 20;
			if (tag.startsWith('Repair_') || tag === 'Service_Lodging') return 30;
			if (tag.startsWith('Trade_')) return 40;
			if (tag.startsWith('Train_')) return 50;
			if (tag.startsWith('Donate_')) return 60;
			return 100; // Altele (Bribe, Ignore, etc.)
		};

		// 1. Criminal Tags (Ordonate exact ca în Definiție)
		const criminalTags = allTags
			.filter((tag) => criminalTagsDef.includes(tag))
			.sort(
				(a, b) => criminalTagsDef.indexOf(a) - criminalTagsDef.indexOf(b),
			);

		// 2. Theft Tags (Ordonate exact ca în Definiție)
		const theftTags = allTags
			.filter((tag) => theftTagsDef.includes(tag))
			.sort((a, b) => theftTagsDef.indexOf(a) - theftTagsDef.indexOf(b));

		// 3. Challenge Tags (Ordonate exact ca în Definiție)
		const challengeTags = allTags
			.filter((tag) => challengeTagsDef.includes(tag))
			.sort(
				(a, b) => challengeTagsDef.indexOf(a) - challengeTagsDef.indexOf(b),
			);

		// 4. Normal Tags (Ordonate după Prioritate -> Apoi Alfabetic)
		const normalTags = allTags
			.filter(
				(tag) =>
					!criminalTagsDef.includes(tag) &&
					!theftTagsDef.includes(tag) &&
					!challengeTagsDef.includes(tag) &&
					tag !== 'Target_Bribe',
			)
			.sort((a, b) => {
				const priorityA = getSortPriority(a);
				const priorityB = getSortPriority(b);

				if (priorityA !== priorityB) {
					return priorityA - priorityB;
				}
				return a.localeCompare(b); // Sortare alfabetică pentru tag-uri din aceeași categorie
			});

		const renderActionButton = (tag) => {
			const actionDef = DB_INTERACTION_ACTIONS[tag];
			if (!actionDef) return null;

			const isApSufficient = playerAp >= actionDef.apCost;

			// Function mapping action tags to unified two-symbol identifiers
			const getActionIcon = (actionTag) => {
				// Combat Actions
				if (actionTag === 'Combat_Engage' || actionTag.startsWith('Fight_'))
					return '⚔️-🩸';
				if (actionTag === 'Combat_Duel') return '⚔️-🤺';
				if (actionTag === 'Combat_Training') return '⚔️-🛡️';
				if (actionTag === 'Combat_Brawl') return '⚔️-👊';

				// Stealth & Crime
				if (actionTag === 'Target_Steal_Coin') return '🥷-🪙';
				if (actionTag === 'Target_Steal_Food') return '🥷-🍎';
				if (actionTag === 'Target_Steal_Animal') return '🥷-🐄';
				if (actionTag === 'Target_Robbery') return '🥷-💰';
				if (actionTag === 'Target_Assassination') return '🥷-☠️';
				if (actionTag.includes('Ambush')) return '🥷-🗡️';
				if (actionTag === 'Target_Bribe') return '🤫-💰';

				// Training & Labor
				if (actionTag === 'Train_STR') return '📜-💪';
				if (actionTag === 'Train_AGI') return '📜-🎯';
				if (actionTag === 'Train_INT') return '📜-🧠';
				if (actionTag === 'Labor_Coin') return '⚒️-🪙';
				if (actionTag === 'Labor_Food') return '⚒️-🍎';

				// Healing & Religion
				if (actionTag.startsWith('Heal_')) return '💊-❤️‍🩹';
				if (actionTag.startsWith('Cure_')) return '💊-⚕️';
				if (actionTag === 'Donate_Pray') return '🙏-🕯️';
				if (actionTag === 'Donate_Coin') return '🙏-💸';
				if (actionTag === 'Donate_Food') return '🙏-🥣';

				// Maintenance & Survival
				if (actionTag === 'Repair_Equipment') return '🛠️-⚙️';
				if (actionTag === 'Service_Lodging') return '⛺-🛏️';
				if (actionTag === 'Hunt_Animal') return '🏹-🦌';
				if (actionTag.startsWith('Evade_')) return '💨-🏃';

				// Trade Actions
				if (actionTag === 'Trade_Weapon') return '⚖️-⚔️';
				if (actionTag === 'Trade_Armor') return '⚖️-🛡️';
				if (actionTag === 'Trade_Shield') return '⚖️-🛡️';
				if (actionTag === 'Trade_Helmet') return '⚖️-🛡️';
				if (actionTag === 'Trade_Food') return '⚖️-🍞';
				if (actionTag === 'Trade_Potion') return '⚖️-🧪';
				if (actionTag === 'Trade_Mount') return '⚖️-🐎';
				if (actionTag === 'Trade_Animal') return '⚖️-🐄';
				if (actionTag === 'Trade_Coin') return '⚖️-🪙';
				if (actionTag === 'Trade_Loot') return '⚖️-💎';

				// Miscellaneous
				if (actionTag === 'Ignore') return '🚶-💨';

				// Fallback
				return '⚡-❓';
			};

			let costClass = styles.costPaid;
			if (actionDef.apCost === 0) {
				costClass = styles.costFree;
			} else if (!isApSufficient) {
				costClass = styles.costUnmet;
			}

			return (
				<button
					key={tag}
					className={styles.btnAction}
					onClick={() =>
						handleActionClick(
							tag,
							selectedInteractNpc.entityId || selectedInteractNpc.id,
						)
					}
					title={actionDef.description}
					disabled={!isApSufficient}
				>
					<span className={styles.actionName}>
						{tag.replace(/_/g, ' ')}
					</span>
					<span className={styles.routeIcon}>{getActionIcon(tag)}</span>
					<span className={`${styles.actionCost} ${costClass}`}>
						{actionDef.apCost}
						<span className={styles.apSymbol}>◈</span>
					</span>
				</button>
			);
		};

		return (
			<div
				className={styles.interactModalOverlay}
				onClick={() => setSelectedInteractNpc(null)}
			>
				<div
					className={styles.interactModalContent}
					onClick={(e) => e.stopPropagation()}
				>
					<h3 className={styles.interactHeader}>
						Interact:{' '}
						{selectedInteractNpc.entityName || selectedInteractNpc.name}
					</h3>

					{normalTags.map(renderActionButton)}

					{/* --- CHALLENGES & SPARRING --- */}
					<div className={styles.hostileSection}>
						<button
							className={styles.btnHostileToggle}
							style={{
								color: challengeTags.length > 0 ? '#eab308' : '#6b7280',
								borderColor:
									challengeTags.length > 0 ? '#eab308' : '#4b5563',
								opacity: challengeTags.length > 0 ? 1 : 0.5,
								cursor:
									challengeTags.length > 0 ? 'pointer' : 'not-allowed',
							}}
							onClick={() =>
								challengeTags.length > 0 &&
								setShowChallenge(!showChallenge)
							}
							disabled={challengeTags.length === 0}
						>
							<span>⚔️ Challenges & Sparring</span>
							<span>
								{challengeTags.length === 0
									? '🔒'
									: showChallenge
										? '▲'
										: '▼'}
							</span>
						</button>
						{showChallenge && challengeTags.length > 0 && (
							<div className={styles.hostileActionContainer}>
								{challengeTags.map(renderActionButton)}
							</div>
						)}
					</div>

					{/* --- THEFT & ROBBERY --- */}
					<div className={styles.hostileSection}>
						<button
							className={styles.btnHostileToggle}
							style={{
								color: theftTags.length > 0 ? '#f97316' : '#6b7280',
								borderColor:
									theftTags.length > 0 ? '#f97316' : '#4b5563',
								opacity: theftTags.length > 0 ? 1 : 0.5,
								cursor:
									theftTags.length > 0 ? 'pointer' : 'not-allowed',
							}}
							onClick={() =>
								theftTags.length > 0 && setShowTheft(!showTheft)
							}
							disabled={theftTags.length === 0}
						>
							<span>🥷 Theft & Robbery</span>
							<span>
								{theftTags.length === 0 ? '🔒' : showTheft ? '▲' : '▼'}
							</span>
						</button>
						{showTheft && theftTags.length > 0 && (
							<div className={styles.hostileActionContainer}>
								{theftTags.map(renderActionButton)}
							</div>
						)}
					</div>

					{/* --- LETHAL ACTIONS --- */}
					<div className={styles.hostileSection}>
						<button
							className={styles.btnHostileToggle}
							style={{
								color: criminalTags.length > 0 ? '#ef4444' : '#6b7280',
								borderColor:
									criminalTags.length > 0 ? '#ef4444' : '#4b5563',
								opacity: criminalTags.length > 0 ? 1 : 0.5,
								cursor:
									criminalTags.length > 0 ? 'pointer' : 'not-allowed',
							}}
							onClick={() =>
								criminalTags.length > 0 &&
								setShowCriminal(!showCriminal)
							}
							disabled={criminalTags.length === 0}
						>
							<span>⚠️ Lethal Actions</span>
							<span>
								{criminalTags.length === 0
									? '🔒'
									: showCriminal
										? '▲'
										: '▼'}
							</span>
						</button>
						{showCriminal && criminalTags.length > 0 && (
							<div className={styles.hostileActionContainer}>
								{criminalTags.map(renderActionButton)}
							</div>
						)}
					</div>

					<button
						className={styles.btnCancel}
						onClick={() => {
							const targetNpc = selectedInteractNpc;
							setSelectedInteractNpc(null);

							// Remove NPC if it was spawned by an event or if located outside a POI
							if (
								targetNpc.isTemporaryEventNpc ||
								!location.currentPoiId
							) {
								dismissActiveEntity(targetNpc.entityId || targetNpc.id);
							}
						}}
					>
						Cancel
					</button>
				</div>
			</div>
		);
	};

	// ========================================================================
	// VIEW: INSIDE POI
	// ========================================================================
	if (location.currentPoiId) {
		const currentPoiData =
			DB_LOCATIONS_POIS_Civilized[location.currentPoiId] ||
			DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

		// 1. Filter out standard systemic tags to isolate custom POI actions
		const specialActionTags =
			currentPoiData?.interactions?.actionTags?.filter(
				(tag) => tag !== 'Enter_Location' && tag !== 'Exit_Location',
			) || [];

		return (
			<div className={styles.viewportContainer}>
				<div className={`${styles.header} ${styles.headerPoi}`}>
					<h2 className={`${styles.title} ${styles.titlePoi}`}>
						{location.currentPoiId.replace(/_/g, ' ')}
					</h2>
					<p className={`${styles.subtitle} ${styles.subtitlePoi}`}>
						{currentPoiData
							? `Rank ${currentPoiData.classification.poiRank} Establishment`
							: 'Establishment'}
					</p>
				</div>

				<div className={styles.description}>
					<p style={{ marginBottom: '20px' }}>
						{currentPoiData?.description ||
							`You have entered the ${location.currentPoiId.replace(/_/g, ' ')}.`}
					</p>
					<POIActions
						actionTags={currentPoiData?.interactions?.actionTags}
						doInteraction={doInteraction}
						regionalExchangeRate={location.regionalExchangeRate}
					/>
					{/* 3. Standard NPC Rendering */}
					{activeEntities.length > 0 ? (
						renderNpcGrid()
					) : (
						<div className={styles.emptyState}>
							The establishment is currently empty.
						</div>
					)}
				</div>

				{renderInteractionModal()}

				{pendingInstantAction && (
					<InstantActionView
						actionTag={pendingInstantAction.tag}
						npcTarget={pendingInstantAction.target}
						onCancel={() => setPendingInstantAction(null)}
						onConfirm={(actionTag, targetId, exchangeRate, amount) =>
							doInteraction(actionTag, targetId, exchangeRate, amount)
						}
						onForceCombat={(npc, rule) => {
							startCombatEncounter(npc, rule);
							setPendingInstantAction(null);
						}}
					/>
				)}
			</div>
		);
	}

	// ========================================================================
	// VIEW: OUTSIDE (MAIN ZONE)
	// ========================================================================
	const bgImagePath = `/regions/${location.currentWorldId}.jpg`;

	return (
		<div
			className={`${styles.viewportContainer} ${styles.viewportZone}`}
			style={{ '--bg-img': `url("${bgImagePath}")` }}
		>
			<div className={styles.header}>
				<h2 className={`${styles.title} ${styles.titleZone}`}>
					{zoneName.replace(/_/g, ' ')}
				</h2>
				<p className={styles.subtitle}>
					Region: <span className={styles.highlight}>{region}</span> |
					Economy: <span className={styles.highlight}>{economy}</span> |
					Danger:{' '}
					<span
						style={{
							color: getDangerColor(dangerPct),
							fontWeight: 'bold',
							marginLeft: '4px',
						}}
					>
						{dangerPct}%
					</span>
				</p>
				<p className={styles.exchangeRateDisplay}>
					Regional Exchange Rate = {exchangeRate}
				</p>
			</div>

			<div className={styles.mainContentArea}>
				{/* The NPC grid rendering has been intentionally removed here. */}
				{/* Entities should only render inside specific POIs, not on the regional map. */}

				<h3 className={styles.sectionTitle}>Points of Interest</h3>

				{isCivilizedZone ? (
					<div className={styles.gridPoi}>
						{(location.availableCivilizedPois || []).map((poiKey) => (
							<button
								key={poiKey}
								className={styles.btnPoi}
								onClick={() => enterPoi(poiKey)}
								disabled={playerAp < 1}
							>
								{poiKey.replace(/_/g, ' ')} 1◈
							</button>
						))}
					</div>
				) : (
					<div
						className={`${styles.emptyState} ${styles.emptyStateUntamed}`}
					>
						<p className={styles.emptyStateText}>
							You are in the untamed wilds. Civilized establishments
							cannot be found here.
						</p>

						<div className={styles.untamedActionsContainer}>
							<Button
								onClick={handleExploreClick}
								disabled={
									playerAp <
									(WORLD.SPATIAL?.actionCosts?.exploreUntamedAp || 1)
								}
								variant='primary'
								className={styles.btnUntamedAction}
							>
								Explore Region 1◈
							</Button>

							<Button
								onClick={handleHuntClick}
								disabled={
									playerAp <
									(WORLD.SPATIAL?.actionCosts?.huntUntamedAp || 1)
								}
								variant='primary'
								className={styles.btnUntamedAction}
							>
								Track & Hunt 1◈
							</Button>

							<Button
								onClick={() => enterPoi('Sandbox_Arena', 'UNTAMED', 0)}
								variant='danger'
								className={styles.btnSandbox}
							>
								TEST SANDBOX (0◈)
							</Button>
						</div>
					</div>
				)}
			</div>

			<div className={styles.bottomRestContainer}>
				<Button
					onClick={() =>
						setPendingInstantAction({ tag: 'Rest_Road', target: null })
					}
					disabled={playerAp < 1}
					variant='green'
					className={styles.btnRestRoad}
				>
					Road Rest 1◈
				</Button>
			</div>

			{renderInteractionModal()}

			{pendingInstantAction && (
				<InstantActionView
					actionTag={pendingInstantAction.tag}
					npcTarget={pendingInstantAction.target}
					onCancel={() => setPendingInstantAction(null)}
					onConfirm={(tag, targetId, rate, sliderValue) => {
						return doInteraction(tag, targetId, rate, sliderValue);
					}}
				/>
			)}
		</div>
	);
};

export default GameViewport;

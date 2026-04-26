// File: Client/src/components/engineViews/GameViewport.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import Button from '../Button';
import NpcInfo from '../NpcInfo';
import styles from '../../styles/GameViewport.module.css';
import InstantActionView from './InstantActionView';
import { WORLD } from '../../data/GameWorld';
import { calculateDangerLevel } from '../../utils/eventProbability';

const GameViewport = ({ onExploreComplete }) => {
	const location = useGameState((state) => state.gameState?.location);
	const activeEntities = useGameState((state) => state.gameState?.activeEntities || []);
	const playerAp = useGameState((state) => state.gameState?.player?.progression?.actionPoints || 0);
	const [pendingInstantAction, setPendingInstantAction] = useState(null);

	const startCombatEncounter = useGameState((state) => state.startCombatEncounter);
	const enterPoi = useGameState((state) => state.enterPoi);
	const exploreUntamed = useGameState((state) => state.exploreUntamed);
	const doHunt = useGameState((state) => state.doHunt);
	const doInteraction = useGameState((state) => state.doInteraction);
	const ensureCivilizedPois = useGameState((state) => state.ensureCivilizedPois);

	const dismissActiveEntity = useGameState((state) => state.dismissActiveEntity);
	const activeTargetId = useGameState((state) => state.gameState?.activeTargetId);
	const currentView = useGameState((state) => state.gameState?.currentView);
	const activeSeason = useGameState((state) => state.gameState?.time?.activeSeason || 'spring');

	const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);
	const [showCriminal, setShowCriminal] = useState(false);
	const [showTheft, setShowTheft] = useState(false);
	const [showChallenge, setShowChallenge] = useState(false);

	const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location?.currentWorldId);
	const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

	useEffect(() => {
		if (isCivilizedZone && (!location.availableCivilizedPois || location.availableCivilizedPois.length === 0)) {
			ensureCivilizedPois();
		}
	}, [isCivilizedZone, location?.availableCivilizedPois, ensureCivilizedPois]);

	useEffect(() => {
		if (currentView === 'VIEWPORT' && activeTargetId && activeEntities.length > 0) {
			const target = activeEntities.find((e) => (e.entityId || e.id) === activeTargetId);

			if (target && !selectedInteractNpc) {
				setSelectedInteractNpc(target);
				setShowCriminal(false);
				setShowTheft(false);
				setShowChallenge(false);

				setTimeout(() => {
					useGameState.setState((state) => ({ gameState: { ...state.gameState, activeTargetId: null } }));
				}, 100);
			}
		}
	}, [currentView, activeTargetId, activeEntities, selectedInteractNpc]);

	if (!location || !location.currentWorldId) return <div>Loading Viewport...</div>;

	const zoneName = currentNode?.zoneName || location.currentWorldId;
	const region = currentNode?.zoneClass || 'Unknown';
	const economy = currentNode?.zoneEconomyLevel || 1;
	const exchangeRate = location.regionalExchangeRate || 10;
	// Calculate the danger percentage
	const dangerPct = Math.round(calculateDangerLevel(location.currentWorldId, activeSeason));


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

		if (actionDef && (actionDef.executionRoute === 'ROUTE_INSTANT' || actionDef.executionRoute === 'ROUTE_COMBAT')) {
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
		<div
			className={styles.gridNpc}
			style={{ marginBottom: '20px' }}
		>
			{activeEntities.map((npc, index) => {
				const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || '?';
				return (
					<div
						key={npc.entityId || npc.id || index}
						className={styles.npcCard}
					>
						<div className={styles.npcHeader}>
							<strong className={styles.npcName}>{npc.entityName || npc.name || 'Unknown Entity'}</strong>
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
								<span className={styles.npcSubclass}>{npc.classification?.entitySubclass || npc.title || 'Unknown'}</span>
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

		const criminalTagsDef = ['Combat_Engage', 'Combat_Ambush', 'Target_Assassination'];
		const theftTagsDef = ['Target_Robbery', 'Target_Steal_Coin', 'Target_Steal_Food'];
		const challengeTagsDef = ['Combat_Duel', 'Combat_Spar', 'Combat_Brawl'];

		const allTags = selectedInteractNpc.interactions?.actionTags || [];

		const criminalTags = allTags.filter((tag) => criminalTagsDef.includes(tag));
		const theftTags = allTags.filter((tag) => theftTagsDef.includes(tag));
		const challengeTags = allTags.filter((tag) => challengeTagsDef.includes(tag));

		const normalTags = allTags.filter(
			(tag) => !criminalTagsDef.includes(tag) && !theftTagsDef.includes(tag) && !challengeTagsDef.includes(tag) && tag !== 'Target_Bribe',
		);

		const renderActionButton = (tag) => {
			const actionDef = DB_INTERACTION_ACTIONS[tag];
			if (!actionDef) return null;

			const isApSufficient = playerAp >= actionDef.apCost;

			const getActionIcon = (actionTag) => {
				if (actionTag.startsWith('Combat_') || actionTag.startsWith('Fight_')) return '⚔️';
				if (actionTag === 'Train_STR') return '📜-💪';
				if (actionTag === 'Train_AGI') return '📜-🎯';
				if (actionTag === 'Train_INT') return '📜-🧠';
				if (actionTag.startsWith('Heal_')) return '💊-❤️‍🩹';
				if (actionTag.startsWith('Cure_')) return '💊-⚕️';
				if (actionTag === 'Labor_Coin') return '⚒️-🪙';
				if (actionTag === 'Labor_Food') return '⚒️-🍎';
				if (actionTag.startsWith('Target_Steal') || actionTag === 'Target_Robbery') return '🥷';
				if (actionTag === 'Target_Assassination') return '☠️';
				if (actionTag === 'Target_Bribe') return '💰';
				if (actionTag === 'Donate_Pray') return '🙏-🕯️';
				if (actionTag === 'Donate_Coin') return '🙏-💸';
				if (actionTag === 'Donate_Food') return '🙏-🥣';
				if (actionTag === 'Repair_Equipment') return '🔨';
				if (actionTag === 'Service_Lodging') return '🛏️';
				if (actionTag === 'Hunt_Animal') return '🏹';
				if (actionTag.startsWith('Evade_')) return '💨';
				if (actionTag === 'Trade_Weapon') return '⚖️-🗡️';
				if (actionTag === 'Trade_Armor') return '⚖️-🧥';
				if (actionTag === 'Trade_Shield') return '⚖️-🛡️';
				if (actionTag === 'Trade_Helmet') return '⚖️-🪖';
				if (actionTag === 'Trade_Food') return '⚖️-🍞';
				if (actionTag === 'Trade_Potion') return '⚖️-🧪';
				if (actionTag === 'Trade_Mount') return '⚖️-🐎';
				if (actionTag === 'Trade_Animal') return '⚖️-🐄';
				if (actionTag === 'Trade_Coin') return '⚖️-🪙';
				if (actionTag === 'Trade_Loot') return '⚖️-💎';
				if (actionTag === 'Ignore') return '🙈';
				return '⚡';
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
					onClick={() => handleActionClick(tag, selectedInteractNpc.entityId || selectedInteractNpc.id)}
					title={actionDef.description}
					disabled={!isApSufficient}
				>
					<span className={styles.actionName}>{tag.replace(/_/g, ' ')}</span>
					<span className={styles.routeIcon}>{getActionIcon(tag)}</span>
					<span className={`${styles.actionCost} ${costClass}`}>{actionDef.apCost} AP</span>
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
					<h3 className={styles.interactHeader}>Interact: {selectedInteractNpc.entityName || selectedInteractNpc.name}</h3>

					{normalTags.map(renderActionButton)}

					{challengeTags.length > 0 && (
						<div className={styles.hostileSection}>
							<button
								className={styles.btnHostileToggle}
								style={{ color: '#eab308', borderColor: '#eab308' }}
								onClick={() => setShowChallenge(!showChallenge)}
							>
								<span>⚔️ Challenges & Sparring</span>
								<span>{showChallenge ? '▲' : '▼'}</span>
							</button>
							{showChallenge && <div className={styles.hostileActionContainer}>{challengeTags.map(renderActionButton)}</div>}
						</div>
					)}

					{theftTags.length > 0 && (
						<div className={styles.hostileSection}>
							<button
								className={styles.btnHostileToggle}
								style={{ color: '#f97316', borderColor: '#f97316' }}
								onClick={() => setShowTheft(!showTheft)}
							>
								<span>🥷 Theft & Robbery</span>
								<span>{showTheft ? '▲' : '▼'}</span>
							</button>
							{showTheft && <div className={styles.hostileActionContainer}>{theftTags.map(renderActionButton)}</div>}
						</div>
					)}

					{criminalTags.length > 0 && (
						<div className={styles.hostileSection}>
							<button
								className={styles.btnHostileToggle}
								style={{ color: '#ef4444', borderColor: '#ef4444' }}
								onClick={() => setShowCriminal(!showCriminal)}
							>
								<span>⚠️ Lethal Actions</span>
								<span>{showCriminal ? '▲' : '▼'}</span>
							</button>
							{showCriminal && <div className={styles.hostileActionContainer}>{criminalTags.map(renderActionButton)}</div>}
						</div>
					)}

					<button
						className={styles.btnCancel}
						onClick={() => {
							const targetNpc = selectedInteractNpc;
							setSelectedInteractNpc(null);

							// Remove NPC if it was spawned by an event or if located outside a POI
							if (targetNpc.isTemporaryEventNpc || !location.currentPoiId) {
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
		const currentPoiData = DB_LOCATIONS_POIS_Civilized[location.currentPoiId] || DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

		return (
			<div className={styles.viewportContainer}>
				<div className={`${styles.header} ${styles.headerPoi}`}>
					<h2 className={`${styles.title} ${styles.titlePoi}`}>{location.currentPoiId.replace(/_/g, ' ')}</h2>
					<p className={`${styles.subtitle} ${styles.subtitlePoi}`}>
						{currentPoiData ? `Rank ${currentPoiData.classification.poiRank} Establishment` : 'Establishment'}
					</p>
				</div>

				<div className={styles.description}>
					<p style={{ marginBottom: '20px' }}>You have entered the {location.currentPoiId.replace(/_/g, ' ')}.</p>
					{activeEntities.length > 0 ? renderNpcGrid() : <div className={styles.emptyState}>The establishment is currently empty.</div>}
				</div>

				{renderInteractionModal()}

				{pendingInstantAction && (
					<InstantActionView
						actionTag={pendingInstantAction.tag}
						npcTarget={pendingInstantAction.target}
						onCancel={() => setPendingInstantAction(null)}
						onConfirm={(actionTag, targetId, exchangeRate, amount) => doInteraction(actionTag, targetId, exchangeRate, amount)}
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
				<h2 className={`${styles.title} ${styles.titleZone}`}>{zoneName.replace(/_/g, ' ')}</h2>
				<p className={styles.subtitle}>
					Region: <span className={styles.highlight}>{region}</span> | Economy: <span className={styles.highlight}>{economy}</span> | Danger:{' '}
					<span style={{ color: getDangerColor(dangerPct), fontWeight: 'bold', marginLeft: '4px' }}>{dangerPct}%</span>
				</p>
				<p className={styles.exchangeRateDisplay}>Regional Exchange Rate = {exchangeRate}</p>
			</div>

			<div className={styles.mainContentArea}>
				{activeEntities.length > 0 && renderNpcGrid()}

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
								{poiKey.replace(/_/g, ' ')} (1 AP)
							</button>
						))}
					</div>
				) : (
					<div className={`${styles.emptyState} ${styles.emptyStateUntamed}`}>
						<p className={styles.emptyStateText}>You are in the untamed wilds. Civilized establishments cannot be found here.</p>

						<div className={styles.untamedActionsContainer}>
							<Button
								onClick={handleExploreClick}
								disabled={playerAp < (WORLD.SPATIAL?.actionCosts?.exploreUntamedAp || 1)}
								variant='primary'
								className={styles.btnUntamedAction}
							>
								Explore Region (1 AP)
							</Button>

							<Button
								onClick={handleHuntClick}
								disabled={playerAp < (WORLD.SPATIAL?.actionCosts?.huntUntamedAp || 1)}
								variant='primary'
								className={styles.btnUntamedAction}
							>
								Track & Hunt (1 AP)
							</Button>

							<Button
								onClick={() => enterPoi('Sandbox_Arena', 'UNTAMED', 0)}
								variant='danger'
								className={styles.btnSandbox}
							>
								TEST SANDBOX (0 AP)
							</Button>
						</div>
					</div>
				)}
			</div>

			<div className={styles.bottomRestContainer}>
				<Button
					onClick={() => setPendingInstantAction({ tag: 'Rest_Road', target: null })}
					disabled={playerAp < 1}
					variant='green'
					className={styles.btnRestRoad}
				>
					Road Rest (1 AP)
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

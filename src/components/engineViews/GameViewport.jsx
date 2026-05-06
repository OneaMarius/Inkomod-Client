// File: Client/src/components/engineViews/GameViewport.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import Button from '../Button';
import styles from '../../styles/GameViewport.module.css';
import InstantActionView from './InstantActionView';
import { WORLD } from '../../data/GameWorld';
import { calculateDangerLevel } from '../../utils/eventProbability';
import PoiViewport from './PoiViewport';
import InteractionModal from './InteractionModal';
import TransitionOverlay from '../ui/TransitionOverlay';

const GameViewport = ({ onExploreComplete }) => {
	const location = useGameState((state) => state.gameState?.location);
	const playerAp = useGameState(
		(state) => state.gameState?.player?.progression?.actionPoints || 0,
	);
	const activeSeason = useGameState(
		(state) => state.gameState?.time?.activeSeason || 'spring',
	);

	// State slices required for quest NPC interactions at the zone level
	const activeEntities = useGameState(
		(state) => state.gameState?.activeEntities || [],
	);
	const activeTargetId = useGameState(
		(state) => state.gameState?.activeTargetId,
	);
	const currentView = useGameState((state) => state.gameState?.currentView);

	const [pendingInstantAction, setPendingInstantAction] = useState(null);
	const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);

	// --- LIPSESC ACESTE STATE-URI PENTRU TRANZIȚIE ---
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [activePoi, setActivePoi] = useState(location?.currentPoiId); // NOU: Urmărește POI-ul efectiv încărcat

	// Action dispatchers
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
	const startCombatEncounter = useGameState(
		(state) => state.startCombatEncounter,
	);

	const currentNode = DB_LOCATIONS_ZONES.find(
		(node) => node.worldId === location?.currentWorldId,
	);
	const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';
	const POI_TRANSITION_MS = 2500; // Definim timpul într-un singur loc

	// Ensure civilized zones always generate POI entrances upon entry
	useEffect(() => {
		if (
			isCivilizedZone &&
			(!location.availableCivilizedPois ||
				location.availableCivilizedPois.length === 0)
		) {
			ensureCivilizedPois();
		}
	}, [isCivilizedZone, location?.availableCivilizedPois, ensureCivilizedPois]);

	// Auto-select target if transitioning from an event or quest outside a POI
	useEffect(() => {
		if (
			currentView === 'VIEWPORT' &&
			activeTargetId &&
			activeEntities.length > 0 &&
			!location?.currentPoiId
		) {
			const target = activeEntities.find(
				(e) => (e.entityId || e.id) === activeTargetId,
			);

			if (target && !selectedInteractNpc) {
				setSelectedInteractNpc(target);

				setTimeout(() => {
					useGameState.setState((state) => ({
						gameState: { ...state.gameState, activeTargetId: null },
					}));
				}, 100);
			}
		}
	}, [
		currentView,
		activeTargetId,
		activeEntities,
		selectedInteractNpc,
		location?.currentPoiId,
	]);

	// --- POI ENTRY TRANSITION LOGIC ---
	useEffect(() => {
		if (location?.currentPoiId && location.currentPoiId !== activePoi) {
			setIsTransitioning(true);

			const timer = setTimeout(() => {
				setActivePoi(location.currentPoiId);
				setIsTransitioning(false);
			}, POI_TRANSITION_MS); // Folosim constanta pentru sincronizare

			return () => clearTimeout(timer);
		} else if (!location?.currentPoiId) {
			setActivePoi(null);
			setIsTransitioning(false);
		}
	}, [location?.currentPoiId, activePoi]);

	if (!location || !location.currentWorldId)
		return <div>Loading Viewport...</div>;

	// ROUTER: Delegate rendering to PoiViewport if inside a POI
	if (location?.currentPoiId) {
		const isOverlayActive =
			isTransitioning || location.currentPoiId !== activePoi;

		return (
			<>
				{/* 1. The overlay mounts on a high z-index and blocks the screen */}
				{isOverlayActive && (
					<TransitionOverlay
						type='ENTER_POI'
						durationMs={POI_TRANSITION_MS}
						payload={location.currentPoiId}
					/>
				)}

				{/* 2. The POI Viewport mounts underneath immediately and starts fetching native assets */}
				<PoiViewport />
			</>
		);
	}

	const zoneName = currentNode?.zoneName || location.currentWorldId;
	const region = currentNode?.zoneClass || 'Unknown';
	const economy = currentNode?.zoneEconomyLevel || 1;
	const exchangeRate = location.regionalExchangeRate || 10;
	const dangerPct = Math.round(
		calculateDangerLevel(location.currentWorldId, activeSeason),
	);

	// Helper for dynamic danger text colors
	const getDangerColor = (pct) => {
		if (pct < 25) return '#22c55e';
		if (pct < 50) return '#3b82f6';
		if (pct < 75) return '#f97316';
		return '#ef4444';
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
					variant='orange'
					className={styles.btnRestRoad}
				>
					Road Rest 1◈
				</Button>
			</div>

			{selectedInteractNpc && (
				<InteractionModal
					npc={selectedInteractNpc}
					playerAp={playerAp}
					onActionClick={handleActionClick}
					onCancel={() => {
						const targetNpc = selectedInteractNpc;
						setSelectedInteractNpc(null);

						// Clear the entity if it is temporary or outside a POI context
						if (targetNpc.isTemporaryEventNpc || !location.currentPoiId) {
							dismissActiveEntity(targetNpc.entityId || targetNpc.id);
						}
					}}
				/>
			)}

			{pendingInstantAction && (
				<InstantActionView
					actionTag={pendingInstantAction.tag}
					npcTarget={pendingInstantAction.target}
					onCancel={(isAbort) => {
						const target = pendingInstantAction.target;

						// 1. Închidem mereu fereastra de acțiune curentă
						setPendingInstantAction(null);

						// 2. Dacă a fost "Abort", restaurăm modalul NPC-ului
						if (isAbort && target) {
							setSelectedInteractNpc(target);
						}
						// 3. Altfel (dacă e acțiune finalizată) și NPC-ul e temporar afară din POI, îl curățăm
						else if (
							target &&
							target.isTemporaryEventNpc &&
							!location.currentPoiId
						) {
							dismissActiveEntity(target.entityId || target.id);
						}
					}}
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
};

export default GameViewport;

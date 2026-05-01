// File: Client/src/components/engineViews/PoiViewport.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import {
	DB_LOCATIONS_POIS_Civilized,
	DB_LOCATIONS_POIS_Untamed,
} from '../../data/DB_Locations_POIS';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import NpcInfo from '../NpcInfo';
import styles from '../../styles/GameViewport.module.css';
import InstantActionView from './InstantActionView';
import POIActions from './POIActions';
import InteractionModal from './InteractionModal';

const PoiViewport = () => {
	const location = useGameState((state) => state.gameState?.location);
	const activeEntities = useGameState(
		(state) => state.gameState?.activeEntities || [],
	);
	const playerAp = useGameState(
		(state) => state.gameState?.player?.progression?.actionPoints || 0,
	);
	const startCombatEncounter = useGameState(
		(state) => state.startCombatEncounter,
	);
	const doInteraction = useGameState((state) => state.doInteraction);
	const dismissActiveEntity = useGameState(
		(state) => state.dismissActiveEntity,
	);
	const activeTargetId = useGameState(
		(state) => state.gameState?.activeTargetId,
	);
	const currentView = useGameState((state) => state.gameState?.currentView);

	const [pendingInstantAction, setPendingInstantAction] = useState(null);
	const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);
	
	// Background image state management
	const [bgImage, setBgImage] = useState('');

	useEffect(() => {
		if (location?.currentPoiId) {
			setBgImage(`/pois/${location.currentPoiId}.jpg`);
		}
	}, [location?.currentPoiId]);

	// Auto-select target if transitioning from combat or event inside a POI
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

				setTimeout(() => {
					useGameState.setState((state) => ({
						gameState: { ...state.gameState, activeTargetId: null },
					}));
				}, 100);
			}
		}
	}, [currentView, activeTargetId, activeEntities, selectedInteractNpc]);

	if (!location || !location.currentPoiId) {
		return null;
	}

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

	const handleImageError = () => {
		if (bgImage !== '/pois/Default.jpg') {
			setBgImage('/pois/Default.jpg');
		}
	};

	const renderNpcGrid = () => (
		<div className={`${styles.gridNpc} ${styles.poiGridBottom}`}>
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
									className={`badgeContainer ${styles.npcBadgeWrapper}`}
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

	const currentPoiData =
		DB_LOCATIONS_POIS_Civilized[location.currentPoiId] ||
		DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

return (
		<div className={styles.viewportContainer}>
			{/* Invisible image element to trigger the fallback logic */}
			{bgImage && (
				<img 
					src={bgImage} 
					alt="POI Background Preload" 
					style={{ display: 'none' }} 
					onError={handleImageError} 
				/>
			)}

			{/* --- 1. HERO SECTION (Square Background Image) --- */}
			<div 
				className={styles.poiTopHero}
				style={{ '--bg-img': `url("${bgImage}")` }}
			>
				<div className={styles.poiHeroContent}>
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
						<p className={styles.poiDescriptionText}>
							{currentPoiData?.description ||
								`You have entered the ${location.currentPoiId.replace(/_/g, ' ')}.`}
						</p>
						<POIActions
							actionTags={currentPoiData?.interactions?.actionTags}
							doInteraction={doInteraction}
							regionalExchangeRate={location.regionalExchangeRate}
						/>
					</div>
				</div>
			</div>

			{/* --- 2. ENTITY SECTION (Solid Background) --- */}
			<div className={styles.poiNpcSection}>
				{activeEntities.length > 0 ? (
					renderNpcGrid()
				) : (
					<div className={styles.emptyState}>
						The establishment is currently empty.
					</div>
				)}
			</div>

			{selectedInteractNpc && (
				<InteractionModal
					npc={selectedInteractNpc}
					playerAp={playerAp}
					onActionClick={handleActionClick}
					onCancel={() => {
						const targetNpc = selectedInteractNpc;
						setSelectedInteractNpc(null);
						if (targetNpc.isTemporaryEventNpc) {
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
						
						setPendingInstantAction(null);

						if (isAbort && target) {
							setSelectedInteractNpc(target);
						} 
						else if (target && target.isTemporaryEventNpc && !location.currentPoiId) {
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

export default PoiViewport;
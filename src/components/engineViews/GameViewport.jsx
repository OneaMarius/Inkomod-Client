// File: Client/src/components/engineViews/GameViewport.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import Button from '../Button';
import NpcInfo from '../NpcInfo'; // NEW: Imported the info modal
import styles from '../../styles/GameViewport.module.css';

const GameViewport = ({ onExploreComplete }) => {
	const location = useGameState((state) => state.gameState?.location);
	const activeEntities = useGameState((state) => state.gameState?.activeEntities || []);
	const playerAp = useGameState((state) => state.gameState?.player?.progression?.actionPoints || 0);

	const enterPoi = useGameState((state) => state.enterPoi);
	const exploreUntamed = useGameState((state) => state.exploreUntamed);
	const doInteraction = useGameState((state) => state.doInteraction);

	// NEW: Modal State Management
	const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);

	if (!location || !location.currentWorldId) return <div>Loading Viewport...</div>;

	const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
	const zoneName = currentNode?.zoneName || location.currentWorldId;
	const region = currentNode?.zoneClass || 'Unknown';
	const economy = currentNode?.zoneEconomyLevel || 1;
	const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

	const exchangeRate = location.regionalExchangeRate || 10;

	const handleExploreClick = () => {
		const result = exploreUntamed();
		if (result && result.status === 'SUCCESS' && onExploreComplete) {
			onExploreComplete(result);
		}
	};

	const handleActionClick = (actionTag, npcId) => {
		console.log(`Dispatching Action: ${actionTag} on Target: ${npcId}`);
		doInteraction(actionTag, npcId, exchangeRate);
		setSelectedInteractNpc(null);
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

					{activeEntities.length > 0 ? (
						<div className={styles.gridNpc}>
							{activeEntities.map((npc, index) => {
								const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || '?';

								return (
									<div
										key={npc.entityId || npc.id || index}
										className={styles.npcCard}
									>
										{/* Minimalist Header */}
										<div className={styles.npcHeader}>
											<strong className={styles.npcName}>{npc.entityName || npc.name || 'Unknown Entity'}</strong>

											<div className={styles.npcMetaRight}>
												<div className={styles.badgeContainer}>
													<div
														className={`${styles.badgeCircle} ${styles.badgeRank}`}
														title='Entity Rank'
													>
														R{npcRank}
													</div>
													{npc.classification?.entityQuality && (
														<div
															className={`${styles.badgeCircle} ${styles[`badgeQ${npc.classification.entityQuality}`]}`}
															title='Entity Quality'
														>
															Q{npc.classification.entityQuality}
														</div>
													)}
												</div>
												<span className={styles.npcSubclass}>{npc.classification?.entitySubclass || npc.title || 'Unknown'}</span>
											</div>
										</div>

										{/* Action Buttons */}
										<div className={styles.cardActions}>
											<NpcInfo npc={npc} />
											<button
												className={styles.btnInteract}
												onClick={() => setSelectedInteractNpc(npc)}
											>
												Interact
											</button>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className={styles.emptyState}>The establishment is currently empty.</div>
					)}
				</div>

				{/* NEW: Centralized Interaction Modal */}
				{selectedInteractNpc && (
					<div
						className={styles.interactModalOverlay}
						onClick={() => setSelectedInteractNpc(null)}
					>
						<div
							className={styles.interactModalContent}
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className={styles.interactHeader}>Interact: {selectedInteractNpc.entityName || selectedInteractNpc.name}</h3>

							{selectedInteractNpc.interactions?.actionTags?.map((tag) => (
								<button
									key={tag}
									className={styles.btnAction}
									onClick={() => handleActionClick(tag, selectedInteractNpc.entityId || selectedInteractNpc.id)}
								>
									{tag.replace(/_/g, ' ')}
								</button>
							))}

							<button
								className={styles.btnCancel}
								onClick={() => setSelectedInteractNpc(null)}
							>
								Cancel
							</button>
						</div>
					</div>
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
					Region: <span className={styles.highlight}>{region}</span> | Economy: <span className={styles.highlight}>{economy}</span>
				</p>
				<p className={styles.exchangeRateDisplay}>Regional Exchange Rate = {exchangeRate}</p>
			</div>

			<div>
				<h3 className={styles.sectionTitle}>Points of Interest</h3>

				{isCivilizedZone ? (
					<div className={styles.gridPoi}>
						{Object.keys(DB_LOCATIONS_POIS_Civilized).map((poiKey) => (
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
						<Button
							onClick={handleExploreClick}
							disabled={playerAp < 1}
							variant='primary'
						>
							Explore Region (1 AP)
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default GameViewport;

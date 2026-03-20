// File: Client/src/components/engineViews/GameViewport.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import {
	DB_LOCATIONS_POIS_Civilized,
	DB_LOCATIONS_POIS_Untamed,
} from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import Button from '../Button';
import styles from '../../styles/GameViewport.module.css';

const GameViewport = ({ onExploreComplete }) => {
	const location = useGameState((state) => state.gameState?.location);
	const activeEntities = useGameState(
		(state) => state.gameState?.activeEntities || [],
	);
	const playerAp = useGameState(
		(state) => state.gameState?.player?.progression?.actionPoints || 0,
	);

	const enterPoi = useGameState((state) => state.enterPoi);
	const exploreUntamed = useGameState((state) => state.exploreUntamed);
	const doInteraction = useGameState((state) => state.doInteraction);

	const [activeInteractionNpcId, setActiveInteractionNpcId] = useState(null);

	if (!location || !location.currentWorldId)
		return <div>Loading Viewport...</div>;

	const currentNode = DB_LOCATIONS_ZONES.find(
		(node) => node.worldId === location.currentWorldId,
	);
	const zoneName = currentNode?.zoneName || location.currentWorldId;
	const region = currentNode?.zoneClass || 'Unknown';
	const economy = currentNode?.zoneEconomyLevel || 3;
	const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

	const handleExploreClick = () => {
		const result = exploreUntamed();
		if (result && result.status === 'SUCCESS' && onExploreComplete) {
			onExploreComplete(result);
		}
	};

	const handleActionClick = (actionTag, npcId) => {
		console.log(`Dispatching Action: ${actionTag} on Target: ${npcId}`);
		doInteraction(actionTag, npcId);
		setActiveInteractionNpcId(null);
	};

	// ========================================================================
	// VIEW: INSIDE POI
	// ========================================================================
	if (location.currentPoiId) {
		const currentPoiData =
			DB_LOCATIONS_POIS_Civilized[location.currentPoiId] ||
			DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

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
						You have entered the{' '}
						{location.currentPoiId.replace(/_/g, ' ')}.
					</p>

					{activeEntities.length > 0 ? (
						<div className={styles.gridNpc}>
							{activeEntities.map((npc, index) => (
								<div
									key={npc.entityId || npc.id || index}
									className={styles.npcCard}
								>
									<div className={styles.npcHeader}>
										<strong className={styles.npcName}>
											{npc.entityName ||
												npc.name ||
												'Unknown Entity'}
										</strong>
										<span className={styles.npcSubclass}>
											{npc.classification?.entitySubclass ||
												npc.title ||
												'Unknown'}
										</span>
									</div>
									<div className={styles.npcStats}>
										<div>
											Class:{' '}
											<span className={styles.highlight}>
												{npc.classification?.entityClass ||
													npc.entityClass ||
													'Unknown'}
											</span>
										</div>
										<div>
											HP:{' '}
											<span className={styles.highlight}>
												{npc.biology?.hpCurrent || 0} /{' '}
												{npc.biology?.hpMax || 0}
											</span>
										</div>
										{(npc.inventory?.silverCoins !== undefined ||
											npc.economy?.baseCoinValue !== undefined) && (
											<div>
												Wealth:{' '}
												<span className={styles.highlight}>
													{npc.inventory?.silverCoins ||
														npc.economy?.baseCoinValue ||
														0}{' '}
													Coins
												</span>
											</div>
										)}
									</div>

									<div className={styles.interactionMenu}>
										{activeInteractionNpcId ===
										(npc.entityId || npc.id) ? (
											<>
												{npc.interactions?.actionTags?.map(
													(tag) => (
														<button
															key={tag}
															className={styles.btnAction}
															onClick={() =>
																handleActionClick(
																	tag,
																	npc.entityId || npc.id,
																)
															}
														>
															{tag.replace(/_/g, ' ')}
														</button>
													),
												)}
												<button
													className={styles.btnCancel}
													onClick={() =>
														setActiveInteractionNpcId(null)
													}
												>
													CANCEL
												</button>
											</>
										) : (
											<button
												className={styles.btnInteract}
												onClick={() =>
													setActiveInteractionNpcId(
														npc.entityId || npc.id,
													)
												}
											>
												Interact
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className={styles.emptyState}>
							The establishment is currently empty.
						</div>
					)}
				</div>
			</div>
		);
	}

	// ========================================================================
	// VIEW: OUTSIDE (MAIN ZONE)
	// ========================================================================
	return (
		<div className={styles.viewportContainer}>
			<div className={styles.header}>
				<h2 className={`${styles.title} ${styles.titleZone}`}>
					{zoneName.replace(/_/g, ' ')}
				</h2>
				<p className={styles.subtitle}>
					Region: <span className={styles.highlight}>{region}</span> |
					Economy: <span className={styles.highlight}>{economy}</span>
				</p>
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
					<div
						className={styles.emptyState}
						style={{ border: 'none', backgroundColor: 'transparent' }}
					>
						<p style={{ marginBottom: '20px' }}>
							You are in the untamed wilds. Civilized establishments
							cannot be found here.
						</p>
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

// File: Client/src/components/inventory/InventoryGrid.jsx
import { useState } from 'react';
import styles from '../../styles/InventoryView.module.css';

const InventoryGrid = ({
	title,
	currentCount,
	maxCount,
	items,
	gridType,
	headerIcons,
	sortOrder,
	toggleSortOrder,
	filterTabs,
	activeFilter,
	setActiveFilter,
	onEquip,
	onDrop,
	onSlaughter,
	calculateMountReductionPct,
	mountCarryWeight,
}) => {
	// Default state set to false (collapsed)
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div
				className={styles.collapsibleHeader}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className={styles.headerLeftGroup}>
					<h3 className={styles.sectionTitleCollapsible}>
						{title} [{currentCount}/{maxCount}]
					</h3>
					{headerIcons && <span className={styles.headerIcons}>{headerIcons}</span>}
				</div>
				<div className={styles.headerRightGroup}>
					<button
						className={styles.sortBtnHeader}
						onClick={(e) => {
							e.stopPropagation();
							toggleSortOrder();
						}}
					>
						Rank {sortOrder === 'DESC' ? '▼' : '▲'}
					</button>
					<span className={styles.toggleIcon}>{isOpen ? '▲' : '▼'}</span>
				</div>
			</div>

			{isOpen && (
				<>
					{filterTabs && filterTabs.length > 0 && (
						<div className={styles.filterContainer}>
							<div className={styles.filterTabs}>
								{filterTabs.map((tab) => (
									<button
										key={tab}
										className={activeFilter === tab ? styles.filterBtnActive : styles.filterBtn}
										onClick={() => setActiveFilter(tab)}
									>
										{tab}
									</button>
								))}
							</div>
						</div>
					)}

					{items.length === 0 ? (
						<div className={styles.emptySection}>No items found.</div>
					) : (
						<div className={styles.gridContainer}>
							{items.map((entity, index) => {
								const rank = entity.classification?.itemTier || entity.classification?.entityRank || null;
								const quality = entity.classification?.itemQuality || entity.classification?.entityQuality || null;

								// Determine the true original index dynamically in case the array was filtered
								const originalIndex = entity._originalIndex !== undefined ? entity._originalIndex : index;

								return (
									<div
										key={entity.entityId || `entity-${index}`}
										className={styles.inventoryCard}
									>
										<div className={styles.itemInfo}>
											{/* Dynamic Quality Color applied to itemName */}
											<div className={`${styles.itemName} ${quality ? `textQ${quality}` : ''}`}>
												{entity.itemName || entity.entityName || entity.name}
											</div>

											<div className='badgeContainer'>
												{rank && <div className='badgeCircle badgeRank'>R{rank}</div>}
												{quality && <div className={`badgeCircle badgeQ${quality}`}>Q{quality}</div>}
											</div>

											<div className={styles.itemClass}>
												{gridType === 'BACKPACK' && (
													<>
														<div>Type: {entity.classification?.itemClass || entity.classification?.itemCategory}</div>
														<div>
															ADP: {entity.stats?.adp || 0} | DDR: {entity.stats?.ddr || 0} | Mass: {entity.stats?.mass || 0} kg
														</div>
														<div>
															Durability: {entity.state?.currentDurability || 0} / {entity.state?.maxDurability || 0}
														</div>
													</>
												)}

												{gridType === 'CARAVAN' && (
													<>
														<div>Type: {entity.classification?.entitySubclass}</div>
														{entity.classification?.entitySubclass === 'Horse' || entity.classification?.entityClass === 'Mount' ? (
															<>
																<div>
																	STR: {entity.stats?.innateStr || entity.stats?.str || 0} | AGI:{' '}
																	{entity.stats?.innateAgi || entity.stats?.agi || 0} (-
																	{calculateMountReductionPct(entity.stats?.innateAgi || entity.stats?.agi || 0)}% AP)
																</div>
																<div>
																	Carry Cap:{' '}
																	{mountCarryWeight.base + (entity.stats?.innateStr || entity.stats?.str || 0) * mountCarryWeight.bonusPerStr}{' '}
																	kg | Mass: {entity.logistics?.entityMass || 0} kg
																</div>
															</>
														) : (
															<div>Mass: {entity.logistics?.entityMass || 0} kg</div>
														)}
														<div>
															HP: {entity.biology?.hpCurrent || 0} / {entity.biology?.hpMax || 0}
														</div>
														<div>
															Food (Cons/Yield): -{entity.logistics?.foodConsumption || 0} / +{entity.logistics?.foodYield || 0}
														</div>
													</>
												)}

												{gridType === 'LOOT' && (
													<>
														<div>Type: {entity.classification?.itemClass || entity.classification?.entityClass || 'Trade Good'}</div>
														<div>Mass: {entity.stats?.mass || entity.logistics?.baseMass || entity.logistics?.entityMass || 0} kg</div>
													</>
												)}
											</div>
										</div>

										<div className={styles.itemActionsContainer}>
											{gridType === 'BACKPACK' && (
												<button
													className={styles.actionButton}
													onClick={() => onEquip(originalIndex, entity.classification?.itemClass)}
												>
													Equip
												</button>
											)}

											{gridType === 'CARAVAN' &&
												(entity.classification?.entitySubclass === 'Horse' || entity.classification?.entityClass === 'Mount' ? (
													<button
														className={styles.actionButton}
														onClick={() => onEquip(originalIndex, 'Mount')}
													>
														Set Mount
													</button>
												) : (
													<span className={styles.livestockLabel}>Livestock</span>
												))}

											{/* Logic: Caravan gets Slaughter, everything else gets Drop */}
											{gridType === 'CARAVAN' ? (
												<button
													className={`${styles.actionButton} ${styles.destructiveButton}`}
													onClick={() => onSlaughter(originalIndex, entity)}
												>
													Slaughter
												</button>
											) : (
												<button
													className={`${styles.actionButton} ${styles.destructiveButton}`}
													onClick={() => onDrop(originalIndex, entity, gridType)}
												>
													Drop
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}
		</>
	);
};

export default InventoryGrid;

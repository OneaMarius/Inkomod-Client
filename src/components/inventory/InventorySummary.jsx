// File: Client/src/components/inventory/InventorySummary.jsx
import { useState } from 'react';
import styles from '../../styles/InventoryView.module.css';

const InventorySummary = ({
	logistics,
	activeMountReductionPct,
	totalFoodCost,
	playerFoodCost,
	mountFoodCost,
	caravanFoodCost,
	getTravelColorClass,
	getMountColorClass,
	getFoodColorClass,
}) => {
	const [isSummaryOpen, setIsSummaryOpen] = useState(false);
	const details = logistics.weightDetails || {};

    // Robust Fallbacks to prevent empty strings
    const massCoins = ((details.massCurrency || 0) + (details.massTradeGoods || 0)).toFixed(1);
    const massFood = (details.massConsumables || 0).toFixed(1);
    const massItems = (details.massItems || 0).toFixed(1);

    const capPlayer = details.basePlayerCapacity || 0;
    const capActiveMount = details.activeMountCapacity || 0;
    const capCaravan = details.caravanMountCapacity || 0;

	return (
		<>
			<div
				className={styles.collapsibleHeader}
				onClick={() => setIsSummaryOpen(!isSummaryOpen)}
			>
				<div className={styles.headerLeftGroup}>
					<h3 className={styles.sectionTitleCollapsible}>Logistics Summary</h3>
					<div className={styles.logisticsHeaderStats}>
						<div className={styles.logisticsStatRow}>
							<span>
								AP: ⚡ <span className={getTravelColorClass(logistics.travelApPenalty)}>+{logistics.travelApPenalty}</span>
							</span>
							<span className={styles.statSeparator}>|</span>
							<span>
								🐴 <span className={getMountColorClass(activeMountReductionPct)}>-{activeMountReductionPct}%</span>
							</span>
						</div>
						<div className={styles.logisticsStatRow}>
							<span>
								Food: 🍞 <span className={getFoodColorClass(totalFoodCost)}>-{totalFoodCost}</span>
							</span>
						</div>
					</div>
				</div>
				<div className={styles.headerRightGroup}>
					<span className={styles.toggleIcon}>{isSummaryOpen ? '▲' : '▼'}</span>
				</div>
			</div>

			{isSummaryOpen && (
				<>
					<div className={styles.summaryBox}>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Encumbrance:</span>
							<span className={styles.summaryValue}>
								{logistics.currentEncumbrance || 0} / {logistics.maxCapacity || 0} kg
							</span>
						</div>
                        
                        <div className={styles.foodSummaryBreakdown} style={{ marginTop: '8px', borderTop: '1px dashed #333', paddingTop: '8px', opacity: 0.8, fontSize: '0.9rem' }}>
                            <div className={styles.breakdownRow}>
                                <span>Coins & Ingots:</span>
                                <span className={styles.textRed}>-{massCoins} kg</span>
                            </div>
                            <div className={styles.breakdownRow}>
                                <span>Food & Potions:</span>
                                <span className={styles.textRed}>-{massFood} kg</span>
                            </div>
                            <div className={styles.breakdownRow} style={{ marginBottom: '8px' }}>
                                <span>Gear & Items:</span>
                                <span className={styles.textRed}>-{massItems} kg</span>
                            </div>
                            
                            <div className={styles.breakdownRow} style={{ borderTop: '1px solid #222', paddingTop: '6px' }}>
                                <span>Player Capacity:</span>
                                <span className={styles.textGreen}>+{capPlayer} kg</span>
                            </div>
                            <div className={styles.breakdownRow}>
                                <span>Active Mount:</span>
                                <span className={styles.textGreen}>+{capActiveMount} kg</span>
                            </div>
                            <div className={styles.breakdownRow}>
                                <span>Caravan Mounts:</span>
                                <span className={styles.textGreen}>+{capCaravan} kg</span>
                            </div>
                        </div>

						<div className={styles.summaryRow} style={{ marginTop: '12px' }}>
							<span className={styles.summaryLabel}>Travel Penalty:</span>
							<span className={logistics.travelApPenalty > 0 ? styles.penaltyActive : styles.summaryValue}>+{logistics.travelApPenalty || 0} AP</span>
						</div>
					</div>

					<div className={styles.summaryBox}>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Equipped Mount Efficiency:</span>
							<span className={activeMountReductionPct > 0 ? styles.penaltyNone : styles.summaryValue}>-{activeMountReductionPct || 0}% AP</span>
						</div>
					</div>

					<div className={`${styles.summaryBox} ${styles.foodSummaryContainer}`}>
						<div className={styles.foodSummaryHeader}>
							<span className={styles.foodSummaryLabel}>Monthly Food Cost:</span>
							<span className={`${styles.foodSummaryTotal} ${getFoodColorClass(totalFoodCost)}`}>-{totalFoodCost || 0}</span>
						</div>
                        {/* Breakdown convertit pe verticală și aliniat prin clasa breakdownRow */}
						<div className={styles.foodSummaryBreakdown} style={{ marginTop: '8px', opacity: 0.9 }}>
							<div className={styles.breakdownRow}>
                                <span>Player:</span>
                                <span className={styles.textRed}>-{playerFoodCost || 0}</span>
                            </div>
							<div className={styles.breakdownRow}>
                                <span>Active Mount:</span>
                                <span className={styles.textRed}>-{mountFoodCost || 0}</span>
                            </div>
							<div className={styles.breakdownRow}>
                                <span>Caravan Mounts:</span>
                                <span className={styles.textRed}>-{caravanFoodCost || 0}</span>
                            </div>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default InventorySummary;
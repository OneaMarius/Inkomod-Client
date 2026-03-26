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
	// MODIFICATION 1: Default state set to false (collapsed)
	const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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
								{logistics.currentEncumbrance} / {logistics.maxCapacity} kg
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Travel Penalty:</span>
							<span className={logistics.travelApPenalty > 0 ? styles.penaltyActive : styles.summaryValue}>+{logistics.travelApPenalty} AP</span>
						</div>
					</div>

					<div className={styles.summaryBox}>
						<div className={styles.summaryRow}>
							<span className={styles.summaryLabel}>Equipped Mount Efficiency:</span>
							<span className={activeMountReductionPct > 0 ? styles.penaltyNone : styles.summaryValue}>-{activeMountReductionPct}% AP</span>
						</div>
					</div>

					<div className={`${styles.summaryBox} ${styles.foodSummaryContainer}`}>
						<div className={styles.foodSummaryHeader}>
							<span className={styles.foodSummaryLabel}>Monthly Food Cost:</span>
							<span className={styles.foodSummaryTotal}>-{totalFoodCost}</span>
						</div>
						<div className={styles.foodSummaryBreakdown}>
							<span>Player: -{playerFoodCost}</span>
							<span>Mount: -{mountFoodCost}</span>
							<span>Caravan: -{caravanFoodCost}</span>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default InventorySummary;

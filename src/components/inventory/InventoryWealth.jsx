// File: Client/src/components/inventory/InventoryWealth.jsx
import { useState } from 'react';
import styles from '../../styles/InventoryView.module.css';

const InventoryWealth = ({ silverCoins, tradeSilver, tradeGold, estimatedSilverValue, estimatedGoldValue }) => {
	// Default state set to false (collapsed)
	const [isWealthOpen, setIsWealthOpen] = useState(false);

	return (
		<>
			<div
				className={styles.collapsibleHeader}
				onClick={() => setIsWealthOpen(!isWealthOpen)}
			>
				<div className={styles.headerLeftGroup}>
					<h3 className={styles.sectionTitleCollapsible}>Wealth</h3>
					<span
						className={styles.headerIcons}
						style={{ display: 'flex', alignItems: 'center' }}
					>
						<span className={`${styles.ingotIcon} ${styles.ingotSilver}`}>S</span>
						<span>x{tradeSilver}</span>

						<span style={{ margin: '0 12px', color: '#555' }}>|</span>

						<span className={`${styles.ingotIcon} ${styles.ingotGold}`}>G</span>
						<span>x{tradeGold}</span>
					</span>
				</div>
				<div className={styles.headerRightGroup}>
					<span className={styles.toggleIcon}>{isWealthOpen ? '▲' : '▼'}</span>
				</div>
			</div>

			{isWealthOpen && (
				<div className={styles.wealthContainer}>
					<div className={styles.wealthCard}>
						<div className={styles.wealthInfo}>
							<span className={styles.wealthName}>
								<div className={styles.coinIcon}>C</div> Silver Coins
							</span>
							<span className={styles.wealthDesc}>Liquid Currency</span>
						</div>
						<span className={styles.wealthValue}>{silverCoins} C</span>
					</div>

					<div className={styles.wealthCard}>
						<div className={styles.wealthInfo}>
							<span className={styles.wealthName}>
								<span className={`${styles.ingotIcon} ${styles.ingotSilver}`}>S</span> Trade Silver
							</span>
							<span className={styles.wealthDesc}>
								Stock: {tradeSilver} ingot{tradeSilver === 1 ? '' : 's'}
							</span>
						</div>
						<div className={styles.wealthEstimate}>
							<span className={styles.estimateLabel}>Est. Value:</span>
							<span className={styles.estimateValue}>{estimatedSilverValue} C</span>
						</div>
					</div>

					<div className={styles.wealthCard}>
						<div className={styles.wealthInfo}>
							<span className={styles.wealthName}>
								<span className={`${styles.ingotIcon} ${styles.ingotGold}`}>G</span> Trade Gold
							</span>
							<span className={styles.wealthDesc}>
								Stock: {tradeGold} ingot{tradeGold === 1 ? '' : 's'}
							</span>
						</div>
						<div className={styles.wealthEstimate}>
							<span className={styles.estimateLabel}>Est. Value:</span>
							<span className={styles.estimateValue}>{estimatedGoldValue} C</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default InventoryWealth;

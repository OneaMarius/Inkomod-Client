// File: Client/src/components/shop/ShopHeaderInfo.jsx
import Button from '../Button';
import { useState } from 'react';
import { WORLD } from '../../data/GameWorld';
import styles from '../../styles/ShopView.module.css';

const ShopHeaderInfo = ({
	merchantName,
	merchantSubclass,
	shopSuffix,
	shopMode,
	isRepairShop,
	bonusDelta,
	absBonusPct,
	actualTotal,
	rawTotal,
	playerCoins,
	diffCoins,
	isInsufficientFunds,
	isZeroTotal,
	isConfirmDisabled,
	cartLength,
	capacityContext,
	tradeTag,
	rer,
	setShopMode,
	setCart,
	setIsConfirmModalOpen,
}) => {
	const isOverburdened = shopMode === 'BUY' && capacityContext?.overlimit;
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const multipliers = WORLD.ECONOMY?.tradeMultipliers || { baseTradeSellPct: 0.5, baseTradeBuyPct: 1.0, baseTradeRepairPct: 0.5, ingotTradeSellPct: 0.75 };

	let baseEnginePct = 100;

	if (shopMode === 'SELL') {
		if (tradeTag === 'Trade_Coin') {
			baseEnginePct = multipliers.ingotTradeSellPct * 100;
		} else {
			baseEnginePct = multipliers.baseTradeSellPct * 100;
		}
	} else if (shopMode === 'REPAIR') {
		baseEnginePct = multipliers.baseTradeRepairPct * 100;
	} else {
		baseEnginePct = multipliers.baseTradeBuyPct * 100;
	}

	let repModifierPct = 0;
	let finalPct = baseEnginePct;

	if (shopMode === 'BUY' || shopMode === 'REPAIR') {
		repModifierPct = bonusDelta > 0 ? -absBonusPct : absBonusPct;
		finalPct = baseEnginePct + repModifierPct;
	} else if (shopMode === 'SELL') {
		repModifierPct = bonusDelta > 0 ? absBonusPct : -absBonusPct;
		finalPct = baseEnginePct + repModifierPct;
	}

	return (
		<div className={styles.fixedTop}>
			<div className={styles.headerTopRow}>
				<div className={styles.merchantSubclass}>{merchantSubclass}</div>
				<div className={styles.rerBadge}>RER: {rer}</div>
			</div>

			<h2 className={styles.shopNameTitle}>
				{merchantName}'s {shopSuffix}
			</h2>

			{!isRepairShop && (
				<div className={styles.modeButtons}>
					<button
						className={`${styles.modeBtn} ${shopMode === 'BUY' ? styles.modeBtnActive : styles.modeBtnInactive}`}
						onClick={() => {
							setShopMode('BUY');
							setCart([]);
						}}
					>
						BUY
					</button>
					<button
						className={`${styles.modeBtn} ${shopMode === 'SELL' ? styles.modeBtnActive : styles.modeBtnInactive}`}
						onClick={() => {
							setShopMode('SELL');
							setCart([]);
						}}
					>
						SELL
					</button>
				</div>
			)}

			{isRepairShop && (
				<div className={styles.modeButtons}>
					<button className={`${styles.modeBtn} ${styles.modeBtnActive}`}>REPAIR SHOP</button>
				</div>
			)}

			<div className={styles.accordionContainer}>
				<button
					onClick={() => setIsDetailsOpen(!isDetailsOpen)}
					className={`${styles.accordionButton} ${isDetailsOpen ? styles.accordionButtonOpen : styles.accordionButtonClosed}`}
				>
					<span className={styles.accordionToggleText}>{isDetailsOpen ? '▼ HIDE DETAILS' : '▲ SHOW DETAILS'}</span>
					<div className={styles.accordionFinalWrapper}>
						<span className={styles.accordionFinalLabel}>Final:</span>
						<span className={styles.accordionFinalValue}>{finalPct}%</span>
					</div>
				</button>

				{isDetailsOpen && (
					<div className={styles.accordionContent}>
						<div className={styles.accordionRow}>
							<span className={styles.accordionLabel}>Base Rate:</span>
							<span style={{ color: '#fff' }}>{baseEnginePct}%</span>
						</div>
						<div className={styles.accordionRow}>
							<span className={styles.accordionLabel}>Reputation:</span>
							<span
								style={{
									color:
										repModifierPct > 0
											? shopMode === 'SELL'
												? '#4ade80'
												: '#ef4444'
											: repModifierPct < 0
												? shopMode === 'SELL'
													? '#ef4444'
													: '#4ade80'
												: '#fff',
								}}
							>
								{repModifierPct > 0 ? '+' : ''}
								{repModifierPct}%
							</span>
						</div>
					</div>
				)}
			</div>

			<div className={styles.checkoutBox}>
				<div className={styles.priceBreakdown}>
					<div className={styles.infoRowSmall}>
						<span>Normal Shop Price:</span>
						<span>{rawTotal} Coins</span>
					</div>

					{cartLength > 0 && diffCoins > 0 && (
						<div className={styles.infoRowSmall}>
							<span className={bonusDelta > 0 ? styles.textPositive : styles.textNegative}>
								{bonusDelta > 0 ? 'Reputation Bonus:' : 'Reputation Penalty:'}
							</span>
							<span
								style={{
									color: finalPct > baseEnginePct ? (shopMode === 'SELL' ? '#4ade80' : '#ef4444') : shopMode === 'SELL' ? '#ef4444' : '#4ade80',
								}}
							>
								{bonusDelta > 0 ? (shopMode === 'SELL' ? '+' : '-') : shopMode === 'SELL' ? '-' : '+'}
								{diffCoins} Coins
							</span>
						</div>
					)}
				</div>

				<div className={styles.totalDisplayHighlight}>
					<span className={styles.totalLabelLarge}>ESTIMATED TOTAL:</span>
					<span className={styles.totalValueLarge}>{actualTotal} Coins</span>
				</div>

				{capacityContext && shopMode === 'BUY' && (
					<div className={styles.capacityRow}>
						<span>{capacityContext.type} Space:</span>
						<span className={capacityContext.overlimit ? styles.textNegative : styles.textPositive}>
							[ {capacityContext.current} / {capacityContext.max} ]
						</span>
					</div>
				)}

				<Button
					variant={isOverburdened ? 'destructive' : 'primary'}
					className={styles.confirmBtnLarge}
					disabled={isConfirmDisabled}
					onClick={() => {
						if (!isConfirmDisabled) setIsConfirmModalOpen(true);
					}}
				>
					{isOverburdened ? 'OVERBURDENED' : `CONFIRM ${shopMode === 'BUY' ? 'PURCHASE' : shopMode === 'REPAIR' ? 'REPAIR' : 'SALE'}`}
				</Button>

				<div className={styles.walletBar}>
					<span>Your Wallet:</span>
					<span className={isInsufficientFunds ? styles.textNegative : styles.textPositive}>{playerCoins} Coins</span>
				</div>

				{isInsufficientFunds && <div className={styles.warningText}>Not enough coins!</div>}
			</div>
		</div>
	);
};

export default ShopHeaderInfo;

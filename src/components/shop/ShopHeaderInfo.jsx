// File: Client/src/components/shop/ShopHeaderInfo.jsx
import Button from '../Button';
import styles from '../../styles/ShopView.module.css';

const ShopHeaderInfo = ({
	shopTitle,
	shopMode,
	isRepairShop,
	bonusDelta,
	absBonusPct,
	actualTotal,
	playerCoins,
	diffCoins,
	isInsufficientFunds,
	isZeroTotal,
	isConfirmDisabled,
	cartLength,
	capacityContext, // NEW PROP
	setShopMode,
	setCart,
	setIsConfirmModalOpen,
}) => {
	// Check if we are currently locked due to inventory capacity
	const isOverburdened = shopMode === 'BUY' && capacityContext?.overlimit;

	return (
		<div className={styles.fixedTop}>
			<h2 className={styles.title}>{shopTitle}</h2>

			{bonusDelta !== 0 && (
				<div className={`${styles.bonusText} ${bonusDelta > 0 ? styles.textPositive : styles.textNegative}`}>
					{shopMode === 'BUY' || shopMode === 'REPAIR'
						? bonusDelta > 0
							? `-${absBonusPct}% (Reputation Discount)`
							: `+${absBonusPct}% (Reputation Penalty)`
						: bonusDelta > 0
							? `+${absBonusPct}% (Reputation Bonus)`
							: `-${absBonusPct}% (Reputation Penalty)`}
				</div>
			)}

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

			<div className={styles.checkoutBox}>
				<div className={styles.checkoutTotal}>
					<span className={styles.checkoutLabel}>Estimated Total:</span>
					<span className={styles.checkoutValue}>{actualTotal} Coins</span>
				</div>

				<div className={styles.infoRow}>
					<span>Your Wallet:</span>
					<span className={isInsufficientFunds ? styles.textNegative : styles.textPositive}>{playerCoins} Coins</span>
				</div>

				{/* CAPACITY COUNTER UI */}
				{capacityContext && shopMode === 'BUY' && (
					<div className={styles.infoRow}>
						<span>{capacityContext.type} Space:</span>
						<span className={capacityContext.overlimit ? styles.textNegative : styles.textPositive}>
							[ {capacityContext.current} / {capacityContext.max} ]
						</span>
					</div>
				)}

				{cartLength > 0 && diffCoins > 0 && (
					<div className={`${styles.infoRow} ${bonusDelta > 0 ? styles.textPositive : styles.textNegative}`}>
						<span>{bonusDelta > 0 ? 'Reputation Savings:' : 'Reputation Penalty:'}</span>
						<span>
							{bonusDelta > 0 ? '+' : '-'}
							{diffCoins} Coins
						</span>
					</div>
				)}

				{/* WARNING MESSAGES */}
				{isInsufficientFunds && <div className={styles.warningText}>Not enough coins!</div>}
				{isZeroTotal && cartLength > 0 && <div className={styles.warningText}>Transaction total is 0. Nothing to process.</div>}
				{isOverburdened && <div className={styles.warningText}>Inventory Limit Reached! Remove items.</div>}

				<Button
					variant={isOverburdened ? 'destructive' : 'primary'}
					className={styles.confirmBtn}
					disabled={isConfirmDisabled}
					onClick={() => {
						if (!isConfirmDisabled) setIsConfirmModalOpen(true);
					}}
				>
					{isOverburdened ? 'OVERBURDENED' : `Confirm ${shopMode === 'BUY' ? 'Purchase' : shopMode === 'REPAIR' ? 'Repair' : 'Sale'}`}
				</Button>
			</div>
		</div>
	);
};

export default ShopHeaderInfo;

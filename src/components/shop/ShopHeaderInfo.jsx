// File: Client/src/components/shop/ShopHeaderInfo.jsx
import Button from '../Button';
import { WORLD } from '../../data/GameWorld';
import styles from '../../styles/ShopView.module.css';

const ShopHeaderInfo = ({
	shopTitle,
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
	setShopMode,
	setCart,
	setIsConfirmModalOpen,
}) => {
	const isOverburdened = shopMode === 'BUY' && capacityContext?.overlimit;

	const multipliers = WORLD.ECONOMY?.tradeMultipliers || {
		baseTradeSellPct: 0.5,
		baseTradeBuyPct: 1.0,
		baseTradeRepairPct: 0.5,
		ingotTradeSellPct: 0.75,
	};

	let baseEnginePct = 100;

	// MODIFICAT: Loot Shop funcționează complet normal (se aplică 50% la vânzare, ca la echipamente)
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

	// Aplicăm matematică normală a reputației pentru toate magazinele
	if (shopMode === 'BUY' || shopMode === 'REPAIR') {
		repModifierPct = bonusDelta > 0 ? -absBonusPct : absBonusPct;
		finalPct = baseEnginePct + repModifierPct;
	} else if (shopMode === 'SELL') {
		repModifierPct = bonusDelta > 0 ? absBonusPct : -absBonusPct;
		finalPct = baseEnginePct + repModifierPct;
	}

	return (
		<div className={styles.fixedTop}>
			<h2 className={styles.title}>{shopTitle}</h2>

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
					<button className={`${styles.modeBtn} ${styles.modeBtnActive}`}>
						REPAIR SHOP
					</button>
				</div>
			)}

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					backgroundColor: '#111',
					border: '1px solid #333',
					borderRadius: '4px',
					padding: '6px 12px',
					marginBottom: '8px',
					fontFamily: '"VT323", monospace',
					fontSize: '1.2rem',
					color: '#ddd',
					width: '100%',
					maxWidth: '300px',
					margin: '0 auto 8px auto',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
						borderBottom: '1px dashed #444',
						paddingBottom: '4px',
						marginBottom: '4px',
					}}
				>
					<span>Base Rate:</span>
					<span style={{ color: '#c5a059' }}>{baseEnginePct}%</span>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
						borderBottom: '1px solid #333',
						paddingBottom: '4px',
						marginBottom: '4px',
					}}
				>
					<span>Reputation:</span>
					<span
						style={{
							color:
								repModifierPct > 0
									? shopMode === 'SELL'
										? '#00dc51aa'
										: '#d70d0daa'
									: repModifierPct < 0
										? shopMode === 'SELL'
											? '#d70d0daa'
											: '#00dc51aa'
										: '#c5a059',
						}}
					>
						{repModifierPct > 0 ? '+' : ''}
						{repModifierPct}%
					</span>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
						fontWeight: 'bold',
					}}
				>
					<span>Final Modifier:</span>
					<span
						style={{
							color:
								finalPct > baseEnginePct
									? shopMode === 'SELL'
										? '#00dc51'
										: '#d70d0d'
									: finalPct < baseEnginePct
										? shopMode === 'SELL'
											? '#d70d0d'
											: '#00dc51'
										: '#c5a059',
						}}
					>
						{finalPct}%
					</span>
				</div>
			</div>

			<div className={styles.checkoutBox}>
				<div className={styles.checkoutTotal}>
					<span className={styles.checkoutLabelNormal}>Normal Price:</span>
					<span className={styles.checkoutValueNormal}>{rawTotal} Coins</span>
				</div>
				{cartLength > 0 && diffCoins > 0 && (
					<div
						className={`${styles.checkoutTotal} ${bonusDelta > 0 ? styles.textPositive : styles.textNegative}`}
					>
						<span>
							{bonusDelta > 0
								? 'Reputation Savings:'
								: 'Reputation Penalty:'}
						</span>
						<span
							style={{
								color:
									finalPct > baseEnginePct
										? shopMode === 'SELL'
											? '#00dc51aa'
											: '#d70d0daa'
										: finalPct < baseEnginePct
											? shopMode === 'SELL'
												? '#d70d0daa'
												: '#00dc51aa'
											: '#c5a059',
							}}
						>
							{bonusDelta > 0
								? shopMode === 'SELL'
									? '+'
									: '-'
								: bonusDelta < 0
									? shopMode === 'SELL'
										? '-'
										: '+'
									: ''}
							{diffCoins} Coins
						</span>
					</div>
				)}
				<div className={styles.checkoutTotal}>
					<span className={styles.checkoutLabelTotal}>Estimated Total:</span>
					<span className={styles.checkoutValueTotal}>{actualTotal} Coins</span>
				</div>

				{capacityContext && shopMode === 'BUY' && (
					<div className={styles.infoRow}>
						<span>{capacityContext.type} Space:</span>
						<span
							className={
								capacityContext.overlimit
									? styles.textNegative
									: styles.textPositive
							}
						>
							[ {capacityContext.current} / {capacityContext.max} ]
						</span>
					</div>
				)}

				{isInsufficientFunds && (
					<div className={styles.warningText}>Not enough coins!</div>
				)}
				{isZeroTotal && cartLength > 0 && (
					<div className={styles.warningText}>
						Transaction total is 0. Nothing to process.
					</div>
				)}
				{isOverburdened && (
					<div className={styles.warningText}>
						Inventory Limit Reached! Remove items.
					</div>
				)}

				<Button
					variant={isOverburdened ? 'destructive' : 'primary'}
					className={styles.confirmBtn}
					disabled={isConfirmDisabled}
					onClick={() => {
						if (!isConfirmDisabled) setIsConfirmModalOpen(true);
					}}
				>
					{isOverburdened
						? 'OVERBURDENED'
						: `Confirm ${shopMode === 'BUY' ? 'Purchase' : shopMode === 'REPAIR' ? 'Repair' : 'Sale'}`}
				</Button>
				<div className={styles.infoRowWallet}>
					<span>Your Wallet:</span>
					<span
						className={
							isInsufficientFunds
								? styles.textNegative
								: styles.textPositive
						}
					>
						{playerCoins} Coins
					</span>
				</div>
			</div>
		</div>
	);
};

export default ShopHeaderInfo;

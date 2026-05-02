// File: Client/src/components/shop/ShopHeaderInfo.jsx
import Button from '../Button';
import { useState } from 'react';
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
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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

			{/* --- MODIFIER DETAILS ACCORDION --- */}
			<div
				style={{
					width: '100%',
					maxWidth: '300px',
					margin: '0 auto 12px auto',
					fontFamily: '"VT323", monospace',
					border: '1px solid #333',
					borderRadius: '4px',
					backgroundColor: '#111',
					overflow: 'hidden',
				}}
			>
				{/* Header / Buton Toggle (Afișează mereu Final Modifier) */}
				<button
					onClick={() => setIsDetailsOpen(!isDetailsOpen)}
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: isDetailsOpen
							? 'rgba(197, 160, 89, 0.1)'
							: 'transparent',
						border: 'none',
						cursor: 'pointer',
						color: '#ddd',
						fontSize: '1.2rem',
					}}
				>
					<span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
						{isDetailsOpen ? '▼ HIDE DETAILS' : '▲ SHOW DETAILS'}
					</span>
					<div
						style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
					>
						<span style={{ fontSize: '1rem' }}>Final:</span>
						<span
							style={{
								color: 'var(--gold-primary)',
								fontWeight: 'bold',
							}}
						>
							{finalPct}%
						</span>
					</div>
				</button>

				{/* Detalii Extensibile (Base Rate & Reputation) */}
				{isDetailsOpen && (
					<div
						style={{
							padding: '8px 12px',
							borderTop: '1px solid #333',
							backgroundColor: 'rgba(0,0,0,0.3)',
							animation: 'fadeIn 0.2s ease-out', // Poți adăuga o animație simplă în CSS
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '4px',
							}}
						>
							<span style={{ opacity: 0.8 }}>Base Rate:</span>
							<span
								style={{
									color: '#fff',
								}}
							>
								{baseEnginePct}%
							</span>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<span style={{ opacity: 0.8 }}>Reputation:</span>
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
				{/* 1. Zona de detalii (mici) */}
				<div className={styles.priceBreakdown}>
					<div className={styles.infoRowSmall}>
						<span>Normal Shop Price:</span>
						<span>{rawTotal} Coins</span>
					</div>

					{cartLength > 0 && diffCoins > 0 && (
						<div className={styles.infoRowSmall}>
							<span
								className={
									bonusDelta > 0
										? styles.textPositive
										: styles.textNegative
								}
							>
								{bonusDelta > 0
									? 'Reputation Bonus:'
									: 'Reputation Penalty:'}
							</span>
							<span
								style={{
									color:
										finalPct > baseEnginePct
											? shopMode === 'SELL'
												? '#4ade80'
												: '#ef4444'
											: shopMode === 'SELL'
												? '#ef4444'
												: '#4ade80',
								}}
							>
								{bonusDelta > 0
									? shopMode === 'SELL'
										? '+'
										: '-'
									: shopMode === 'SELL'
										? '-'
										: '+'}
								{diffCoins} Coins
							</span>
						</div>
					)}
				</div>

				{/* 2. Zona HIGHLIGHT (Totalul principal) */}
				<div className={styles.totalDisplayHighlight}>
					<span className={styles.totalLabelLarge}>ESTIMATED TOTAL:</span>
					<span className={styles.totalValueLarge}>
						{actualTotal} Coins
					</span>
				</div>

				{/* 3. Avertismente și Spațiu */}
				{capacityContext && shopMode === 'BUY' && (
					<div className={styles.capacityRow}>
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

				{/* 4. Butonul Principal */}
				<Button
					variant={isOverburdened ? 'destructive' : 'primary'}
					className={styles.confirmBtnLarge}
					disabled={isConfirmDisabled}
					onClick={() => {
						if (!isConfirmDisabled) setIsConfirmModalOpen(true);
					}}
				>
					{isOverburdened
						? 'OVERBURDENED'
						: `CONFIRM ${shopMode === 'BUY' ? 'PURCHASE' : shopMode === 'REPAIR' ? 'REPAIR' : 'SALE'}`}
				</Button>

				{/* 5. Wallet Info sub buton */}
				<div className={styles.walletBar}>
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

				{/* Mesaje de eroare (Absolute positioned if needed) */}
				{isInsufficientFunds && (
					<div className={styles.warningText}>Not enough coins!</div>
				)}
			</div>
		</div>
	);
};

export default ShopHeaderInfo;

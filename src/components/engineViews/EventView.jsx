// File: Client/src/components/engineViews/EventView.jsx
import { useState, useEffect } from 'react';
import Button from '../Button';
import styles from '../../styles/EventView.module.css';

// --- DICTIONARE SI FUNCTII UTILITARE (RESTABILITE CU ICONITE) ---

const getHeaderVisuals = (eventType, typology) => {
	let typeAura = 'NEUTRAL';
	let typeIcon = '⚪';
	if (eventType === 'POSITIVE') {
		typeAura = 'POSITIVE';
		typeIcon = '🟢';
	}
	if (eventType === 'NEGATIVE') {
		typeAura = 'NEGATIVE';
		typeIcon = '🔴';
	}

	let typoIcon = '🧩'; // General fallback
	if (typology === 'CombatEncounter') typoIcon = '⚔️';
	if (typology === 'SocialEncounter') typoIcon = '🤝';
	if (typology === 'Discovery') typoIcon = '🔍';
	if (typology === 'Hazard') typoIcon = '🌩️';

	return { typeAura, typeIcon, typoIcon };
};

const getChoiceVisuals = (choice) => {
	// FIX 6: Adăugăm mapare directă pe 'action' pentru butoanele de sistem/navigare
	if (choice.action === 'ENTER_POI') return ['🗺️', '🚶'];
	if (choice.action === 'LEAVE') return ['🔙', '🏃'];

	switch (choice.checkType) {
		case 'COMBAT':
			let combatIcon = '🩸'; // DMF fallback
			if (choice.combatRule === 'NF') combatIcon = '🛡️';
			if (choice.combatRule === 'FF') combatIcon = '🏳️';
			return ['⚔️', combatIcon];
		case 'SKILL_CHECK':
			let attrIcon = '❓';
			if (choice.attribute === 'str') attrIcon = '💪';
			if (choice.attribute === 'agi') attrIcon = '🤸';
			if (choice.attribute === 'int') attrIcon = '🧠';
			return ['🎲', attrIcon];
		case 'TRADE_OFF':
			let costIcon = '🪙';
			if (choice.cost?.food) costIcon = '🍞';
			if (choice.cost?.silverCoins) costIcon = '💰';
			return ['⚖️', costIcon];
		case 'LUCK_CHECK':
			return ['🍀', '🎲'];
case 'GENERAL':
			const label = (choice.label || '').toLowerCase();
			
			// 1. Animal Management / Caravan
			if (label.includes('caravan') || label.includes('keep') || label.includes('tame')) {
				return ['🐎', '🐄'];
			}

			// 2. Harvesting / Slaughtering
			if (label.includes('slaughter') || label.includes('meat') || label.includes('harvest') || label.includes('butcher')) {
				return ['🔪', '🥩'];
			}

			// 3. Evitare, ignorare, plecare, ascundere
			if (label.includes('ignore') || label.includes('walk') || label.includes('leave') || label.includes('sneak') || label.includes('hide')) {
				return ['🚶', '💨'];
			}

			// 4. Refuz sau evitare politicoasă
			if (label.includes('decline') || label.includes('refuse') || label.includes('spare') || label.includes('release')) {
				return ['🖐️', '🛑'];
			}

			// 5. Acțiuni de asistență / ghidare
			if (label.includes('escort') || label.includes('guide') || label.includes('help') || label.includes('assist')) {
				return ['🗺️', '🤝'];
			}

			// 6. Investigare / Căutare
			if (label.includes('search') || label.includes('investigate') || label.includes('inspect') || label.includes('track')) {
				return ['🔍', '👀'];
			}

			// Fallback generic
			return ['⚙️', '✔️'];
		case 'STANDARD_INTERACTION':
			return ['💬','🗣️'];
		default:
			return ['❓', '❓'];
	}
};

const getChoiceMechanicsInfo = (choice, activeEventNpc, playerData) => {
	switch (choice.checkType) {
		case 'TRADE_OFF':
			const costs = [];
			if (choice.cost?.silverCoins) costs.push(`${choice.cost.silverCoins} Silver`);
			if (choice.cost?.food) costs.push(`${choice.cost.food} Food`);
			return `Cost: ${costs.join(', ')}`;

		case 'SKILL_CHECK':
			const npcRank = activeEventNpc?.classification?.entityRank || 1;
			const diffMod = choice.difficultyModifier || 0;
			const dc = 10 + (npcRank + diffMod) * 5;

			let chanceString = '';

			if (playerData && playerData.stats && playerData.identity) {
				const playerRank = playerData.identity.rank || 1;
				const playerAttrValue = playerData.stats[choice.attribute] || 10;

				const minRoll = -5;
				const maxRoll = 5 + playerRank * 2;
				const totalOutcomes = maxRoll - minRoll + 1;

				const requiredRoll = dc - playerAttrValue;

				let successfulOutcomes = maxRoll - requiredRoll + 1;

				if (successfulOutcomes < 0) successfulOutcomes = 0;
				if (successfulOutcomes > totalOutcomes) successfulOutcomes = totalOutcomes;

				const percentage = Math.round((successfulOutcomes / totalOutcomes) * 100);
				chanceString = ` (${percentage}%)`;
			}

			return `Target DC: ${dc}${chanceString}`;

		case 'LUCK_CHECK':
			return `Chance: ${choice.successChance || 50}%`;

		case 'COMBAT':
			if (activeEventNpc) {
				return `vs Rank ${activeEventNpc.classification?.entityRank || 1}`;
			}
			return 'Fight';
		
		case 'STANDARD_INTERACTION':
			return 'Open Action Menu';

		default:
			return '';
	}
};

// --- COMPONENTA PRINCIPALA ---

const EventView = ({ eventData, activeEventNpc, resolutionData, onAcknowledge, onChoice, playerData }) => {
	// State local pentru gestionarea animației de calcul
	const [isAnimating, setIsAnimating] = useState(false);
	const [scrambleValue, setScrambleValue] = useState('00');

	useEffect(() => {
		// Dacă primim date de rezoluție care implică un zar, declanșăm animația
		if (resolutionData && resolutionData.rollDetails) {
			setIsAnimating(true);

			// Interval pentru efectul de numere aleatorii ("scramble")
			const scrambleInterval = setInterval(() => {
				const rand = Math.floor(Math.random() * 90) + 10; // Numere între 10 și 99
				setScrambleValue(rand.toString());
			}, 50);

			// Oprim animația după 1.5 secunde
			const animationTimeout = setTimeout(() => {
				clearInterval(scrambleInterval);
				setIsAnimating(false);
			}, 1500);

			// Cleanup function
			return () => {
				clearInterval(scrambleInterval);
				clearTimeout(animationTimeout);
			};
		} else {
			// Dacă nu sunt date de zar (ex: TRADE_OFF), nu animăm
			setIsAnimating(false);
		}
	}, [resolutionData]);

	if (!eventData) return null;

	const playerInventory = playerData?.inventory || { food: 0, silverCoins: 0 };

	// ========================================================================
	// PHAZA 1.5: ECRAN ANIMAȚIE (Interceptare)
	// ========================================================================
	if (resolutionData && isAnimating) {
		return (
			<div className={styles.container}>
				<div className={styles.animationContainer}>
					<div className={styles.analyzingText}>Calculating Parameters</div>
					<div className={styles.scrambleText}>{scrambleValue}</div>
				</div>
			</div>
		);
	}

	// ========================================================================
	// PHAZA 2: REZOLUȚIE (Rezultat final + Detalii Zar)
	// ========================================================================
	if (resolutionData && !isAnimating) {
		const rollDetails = resolutionData.rollDetails;

		return (
			<div className={styles.container}>
				<h2 className={styles.title}>Result</h2>

				{/* Caseta cu detaliile matematice ale aruncării (Dacă există) */}
				{rollDetails && (
					<div className={styles.rollBreakdownBox}>
						<div className={styles.breakdownHeader}>{rollDetails.type === 'LUCK_CHECK' ? 'LUCK CHECK' : `SKILL CHECK (${rollDetails.attribute})`}</div>

						{rollDetails.type === 'LUCK_CHECK' && (
							<div className={styles.breakdownData}>
								Rolled: {rollDetails.roll} (Required: &le; {rollDetails.target})
							</div>
						)}

						{rollDetails.type === 'SKILL_CHECK' && (
							<div className={styles.breakdownData}>
								Base {rollDetails.base} + Roll {rollDetails.roll} = {rollDetails.total} vs DC {rollDetails.target}
							</div>
						)}

						<div className={rollDetails.isSuccess ? styles.resultSuccess : styles.resultFailure}>{rollDetails.isSuccess ? 'SUCCESS' : 'FAILED'}</div>
					</div>
				)}

				<p className={styles.description}>{resolutionData.resultDescription || 'The situation has been resolved.'}</p>

				{/* Afișarea consecințelor (Modificări de resurse) */}
				{resolutionData.changes && resolutionData.changes.length > 0 && (
					<div className={styles.effectsContainer}>
						<h3 className={styles.effectsHeader}>Consequences</h3>
						{resolutionData.changes.map((change, index) => {
							// NEW LOGIC: Intercept physical item acquisition for choice resolution
							if (change.label === 'Acquired') {
								return (
									<div
										key={index}
										className={styles.effectRow}
									>
										<span
											className={styles.effectLabel}
											style={{ color: '#4ade80', fontWeight: 'bold' }}
										>
											Acquired
										</span>
										<span style={{ color: '#fbbf24', fontWeight: 'bold', textAlign: 'right' }}>{change.value}</span>
									</div>
								);
							}

							// EXISTING LOGIC: Standard numeric modifiers
							const isPositive = typeof change.value === 'number' ? change.value > 0 : String(change.value).startsWith('+');
							const isNegative = typeof change.value === 'number' ? change.value < 0 : String(change.value).startsWith('-');
							const displayValue = typeof change.value === 'number' && change.value > 0 ? `+${change.value}` : change.value;

							let valueClass = styles.neutralValue;
							if (isPositive) valueClass = styles.positiveValue;
							if (isNegative) valueClass = styles.negativeValue;

							return (
								<div
									key={index}
									className={styles.effectRow}
								>
									<span className={styles.effectLabel}>{change.label}</span>
									<span className={valueClass}>{displayValue}</span>
								</div>
							);
						})}
					</div>
				)}

				<Button
					onClick={onAcknowledge}
					variant='primary'
				>
					Confirm & Continue
				</Button>
			</div>
		);
	}

	// ========================================================================
	// PHAZA 1: DECIZIE (Ecranul inițial cu opțiuni)
	// ========================================================================
	const { typeAura, typeIcon, typoIcon } = getHeaderVisuals(eventData.eventType, eventData.typology);
	const formattedTypology = eventData.typology?.replace(/([A-Z])/g, ' $1').trim() || 'General';

	return (
		<div className={styles.container}>
			{/* Header Badges */}
			<div className={styles.headerBadges}>
				<div className={`${styles.eventBadge} ${styles[`aura${typeAura}`]}`}>
					<span>{typeIcon}</span> {eventData.eventType}
				</div>
				<div className={styles.eventBadge}>
					<span>{typoIcon}</span> {formattedTypology}
				</div>
			</div>

			<h2 className={styles.title}>{eventData.name || 'Event'}</h2>
			{eventData.subtitle && <h3 className={styles.eventSubtitle}>{eventData.subtitle}</h3>}
			<p className={styles.description}>{eventData.description || 'You have encountered something on your journey.'}</p>

			{/* Afișare Inamic (Dacă există) */}
			{activeEventNpc && (
				<div style={{ padding: '10px', margin: '15px 0', border: '1px solid #444', backgroundColor: '#111', borderRadius: '6px' }}>
					<div style={{ color: '#ef4444', marginBottom: '5px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Threat Detected</div>
					<div style={{ fontSize: '1.2rem', color: '#fff' }}>{activeEventNpc.entityName}</div>
					<div style={{ color: '#aaa', fontSize: '0.9rem' }}>
						Rank {activeEventNpc.classification?.entityRank} {activeEventNpc.classification?.entitySubclass}
					</div>
					<div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px', fontStyle: 'italic' }}>{activeEventNpc.entityDescription}</div>
				</div>
			)}

			{/* Efecte Statice Inițiale (SEE Events) */}
			{eventData.changes && eventData.changes.length > 0 && (
				<div className={styles.effectsContainer}>
					<h3 className={styles.effectsHeader}>Event Effects</h3>
					{eventData.changes.map((change, index) => {
						// NEW LOGIC: Intercept physical item acquisition to apply distinct styling
						if (change.label === 'Acquired') {
							return (
								<div
									key={index}
									className={styles.effectRow}
								>
									<span
										className={styles.effectLabel}
										style={{ color: '#4ade80', fontWeight: 'bold' }}
									>
										Acquired
									</span>
									<span style={{ color: '#fbbf24', fontWeight: 'bold', textAlign: 'right' }}>{change.value}</span>
								</div>
							);
						}

						// EXISTING LOGIC: Standard numeric modifiers
						const isPositive = typeof change.value === 'number' ? change.value > 0 : String(change.value).startsWith('+');
						const isNegative = typeof change.value === 'number' ? change.value < 0 : String(change.value).startsWith('-');
						const displayValue = typeof change.value === 'number' && change.value > 0 ? `+${change.value}` : change.value;

						let valueClass = styles.neutralValue;
						if (isPositive) valueClass = styles.positiveValue;
						if (isNegative) valueClass = styles.negativeValue;

						return (
							<div
								key={index}
								className={styles.effectRow}
							>
								<span className={styles.effectLabel}>{change.label}</span>
								<span className={valueClass}>{displayValue}</span>
							</div>
						);
					})}
				</div>
			)}

			{/* Secțiune Butoane Decizie (DEE Events) în format Grid 2x2 */}
			{eventData.choices && eventData.choices.length > 0 ? (
				<div className={styles.choicesContainer}>
					{eventData.choices.map((choice, index) => {
						let canAfford = true;

						// Verificare resurse pentru TRADE_OFF
						if (choice.checkType === 'TRADE_OFF' && choice.cost) {
							if (choice.cost.silverCoins && playerInventory.silverCoins < choice.cost.silverCoins) canAfford = false;
							if (choice.cost.food && playerInventory.food < choice.cost.food) canAfford = false;
						}

						// Obținem iconițele și textul mecanic (procentaj, DC, cost)
						const [icon1, icon2] = getChoiceVisuals(choice);
						const mechanicsText = getChoiceMechanicsInfo(choice, activeEventNpc, playerData);

						return (
							<Button
								key={index}
								onClick={() => onChoice(choice)}
								variant={choice.variant || 'primary'}
								disabled={!canAfford}
							>
								<div className={styles.choiceContent}>
									{/* Coloana 1: Iconițe stivuite vertical */}
									<div className={styles.choiceIconBox}>
										<span>{icon1}</span>
										<span>{icon2}</span>
									</div>

									{/* Coloana 2: Zona de text (Titlu + Mecanică), centrată */}
									<div className={styles.choiceTextArea}>
										<span className={styles.choiceLabel}>{choice.label}</span>
										<span className={`${styles.choiceMechanics} ${!canAfford ? styles.costWarning : ''}`}>{mechanicsText}</span>
									</div>
								</div>
							</Button>
						);
					})}
				</div>
			) : (
				// Buton simplu de continuare pentru SEE Events
				<div className={styles.singleButtonContainer}>
					<Button
						onClick={onAcknowledge}
						variant='primary'
					>
						Continue
					</Button>
				</div>
			)}
		</div>
	);
};

export default EventView;

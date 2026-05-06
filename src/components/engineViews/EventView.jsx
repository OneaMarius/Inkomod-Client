// File: Client/src/components/engineViews/EventView.jsx
import { useState, useEffect } from 'react';
import Button from '../Button';
import NpcAvatar from '../NpcAvatar';
import { getEntityAvatar, getFallbackAvatar } from '../../utils/AvatarResolver';
import styles from '../../styles/EventView.module.css';

const getTypologyBackgroundClass = (typology) => {
	if (typology === 'CombatEncounter') return styles.bgCombat;
	if (typology === 'Hazard') return styles.bgHazard;
	if (typology === 'Discovery') return styles.bgDiscovery;
	if (typology === 'SocialEncounter') return styles.bgSocial;
	return styles.bgGeneral;
};

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
	// Direct mapping on 'action' for system/navigation buttons
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
			if (label.includes('caravan') || label.includes('animal') || label.includes('tame')) {
				return ['🐎', '🐄'];
			}

			// 2. Harvesting / Slaughtering
			if (label.includes('slaughter') || label.includes('meat') || label.includes('harvest') || label.includes('butcher')) {
				return ['🔪', '🥩'];
			}

			// 3. Evade, ignore, leave, hide
			if (label.includes('ignore') || label.includes('walk') || label.includes('leave') || label.includes('sneak') || label.includes('hide')) {
				return ['🚶', '💨'];
			}

			// 4. Helping / Assisting / Rescuing / Guiding
			if (
				label.includes('help') ||
				label.includes('assist') ||
				label.includes('escort') ||
				label.includes('guide') ||
				label.includes('bury') ||
				label.includes('rescue')
			) {
				return ['🤝', '🛡️'];
			}

			// 5. Polite refusal or avoidance
			if (label.includes('decline') || label.includes('refuse') || label.includes('spare') || label.includes('release') || label.includes('lower')) {
				return ['🖐️', '🛑'];
			}

			// 6. Taking / Looting (from the dead or found)
			if (label.includes('take') || label.includes('loot') || label.includes('pocket')) {
				return ['🎒', '💰'];
			}

			// 7. Retreating / Fleeing (Fear-based leaving)
			if (label.includes('flee') || label.includes('retreat') || label.includes('run')) {
				return ['🏃', '😨'];
			}

			// 8. Investigation / Search
			if (label.includes('search') || label.includes('investigate') || label.includes('inspect') || label.includes('track')) {
				return ['🔍', '👀'];
			}

			// Generic fallback
			return ['⚙️', '✔️'];
		case 'STANDARD_INTERACTION':
			return ['💬', '🗣️'];
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

const EventView = ({ eventData, activeEventNpc, resolutionData, onAcknowledge, onChoice, playerData }) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [scrambleValue, setScrambleValue] = useState('00');

	useEffect(() => {
		if (resolutionData && resolutionData.rollDetails) {
			setIsAnimating(true);
			const scrambleInterval = setInterval(() => {
				const rand = Math.floor(Math.random() * 90) + 10;
				setScrambleValue(rand.toString());
			}, 50);

			const animationTimeout = setTimeout(() => {
				clearInterval(scrambleInterval);
				setIsAnimating(false);
			}, 1500);

			return () => {
				clearInterval(scrambleInterval);
				clearTimeout(animationTimeout);
			};
		} else {
			setIsAnimating(false);
		}
	}, [resolutionData]);

	if (!eventData) return null;

	const playerInventory = playerData?.inventory || { food: 0, silverCoins: 0 };

	const bgClass = getTypologyBackgroundClass(eventData.typology);
	const themeClass = styles[`theme${eventData.eventType || 'NEUTRAL'}`] || styles.themeNEUTRAL;
	const { typeAura, typeIcon, typoIcon } = getHeaderVisuals(eventData.eventType, eventData.typology);
	const formattedTypology = eventData.typology?.replace(/([A-Z])/g, ' $1').trim() || 'General';

	// Phase 1.5: Animation Screen
	if (resolutionData && isAnimating) {
		return (
			<div className={`${styles.container} ${bgClass} ${themeClass}`}>
				<div className={styles.animationContainer}>
					<div className={styles.analyzingText}>Calculating Parameters</div>
					<div className={styles.scrambleText}>{scrambleValue}</div>
				</div>
			</div>
		);
	}

	// Phase 2: Resolution Screen
	if (resolutionData && !isAnimating) {
		const rollDetails = resolutionData.rollDetails;
		return (
			<div className={`${styles.container} ${bgClass} ${themeClass}`}>
				<div className={styles.typologyBadge}>
					<span>{typoIcon}</span> {formattedTypology}
				</div>

				<h2 className={styles.title}>Result</h2>

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

				{resolutionData.changes && resolutionData.changes.length > 0 && (
					<div className={styles.effectsContainer}>
						<h3 className={styles.effectsHeader}>Consequences</h3>
						{resolutionData.changes.map((change, index) => {
							if (change.label === 'Acquired') {
								return (
									<div
										key={index}
										className={styles.effectRow}
									>
										<span className={styles.effectLabelAcquired}>Acquired</span>
										<span className={styles.effectValueAcquired}>{change.value}</span>
									</div>
								);
							}

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

	// Phase 1: Decision Screen
	return (
		<div className={`${styles.container} ${bgClass} ${themeClass}`}>
			<div className={styles.typologyBadge}>
				<span>{typoIcon}</span> {formattedTypology}
			</div>

			<div className={styles.headerBadges}>
				<div className={`${styles.eventBadge} ${styles[`aura${typeAura}`]}`}>
					<span>{typeIcon}</span> {eventData.eventType}
				</div>
			</div>

			<h2 className={styles.title}>{eventData.name || 'Event'}</h2>

			{eventData.subtitle && <h3 className={styles.eventSubtitle}>{eventData.subtitle}</h3>}

			<p className={styles.description}>{eventData.description || 'You have encountered something on your journey.'}</p>

			{/* Threat Detected Block with Avatar Integration */}
			{activeEventNpc &&
				(() => {
					const npcCategory = activeEventNpc.classification?.entityCategory || 'Human';
					const npcClass = activeEventNpc.classification?.entityClass || 'Unknown Class';
					const npcSubclass = activeEventNpc.classification?.entitySubclass || null;
					const npcRank = activeEventNpc.classification?.entityRank || 1;

					const npcPrimaryAvatar = getEntityAvatar(npcCategory, npcClass, npcSubclass);
					const npcFallbackAvatar = getFallbackAvatar(npcCategory);
					const formattedSubclass = npcSubclass ? npcSubclass.replace(/_/g, ' ') : npcClass.replace(/_/g, ' ');

					return (
						<div className={styles.threatContainer}>
							<div className={styles.threatAvatarBox}>
								<NpcAvatar
									src={npcPrimaryAvatar || '/avatars/default_npc.png'}
									rank={npcRank}
									size={80}
									alt={activeEventNpc.entityName || 'Enemy'}
									onError={(e) => {
										const currentSrc = e.target.src;
										const classFallback = getEntityAvatar(npcCategory, npcClass, null);
										const finalFallback = npcFallbackAvatar || '/avatars/default_npc.png';

										if (classFallback && !currentSrc.includes(classFallback) && !currentSrc.includes(finalFallback)) {
											e.target.src = classFallback;
										} else if (!currentSrc.includes(finalFallback)) {
											e.target.src = finalFallback;
										}
									}}
								/>
							</div>
							<div className={styles.threatInfoBox}>
								<div className={styles.threatHeader}>Threat Detected</div>
								<div className={styles.threatName}>{activeEventNpc.entityName}</div>
								<div className={styles.threatRank}>
									Rank {npcRank} {formattedSubclass}
								</div>
								<div className={styles.threatDesc}>{activeEventNpc.entityDescription}</div>
							</div>
						</div>
					);
				})()}

			{eventData.changes && eventData.changes.length > 0 && (
				<div className={styles.effectsContainer}>
					<h3 className={styles.effectsHeader}>Event Effects</h3>
					{eventData.changes.map((change, index) => {
						if (change.label === 'Acquired') {
							return (
								<div
									key={index}
									className={styles.effectRow}
								>
									<span className={styles.effectLabelAcquired}>Acquired</span>
									<span className={styles.effectValueAcquired}>{change.value}</span>
								</div>
							);
						}

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

			{eventData.choices && eventData.choices.length > 0 ? (
				<div className={styles.choicesContainer}>
					{eventData.choices.map((choice, index) => {
						let canAfford = true;
						if (choice.checkType === 'TRADE_OFF' && choice.cost) {
							if (choice.cost.silverCoins && playerInventory.silverCoins < choice.cost.silverCoins) {
								canAfford = false;
							}
							if (choice.cost.food && playerInventory.food < choice.cost.food) {
								canAfford = false;
							}
						}

						const [icon1, icon2] = getChoiceVisuals(choice);
						const mechanicsText = getChoiceMechanicsInfo(choice, activeEventNpc, playerData);

						return (
							<Button
								key={index}
								onClick={() => onChoice(choice)}
								variant={choice.variant || 'primary'}
								disabled={!canAfford}
								style={{ padding: '5px', marginTop: '5px' }}
							>
								<div className={styles.choiceContent}>
									<div className={styles.choiceIconBox}>
										<span>{icon1}</span>
										<span>{icon2}</span>
									</div>
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

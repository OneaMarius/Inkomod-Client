// File: Client/src/components/engineViews/EventView.jsx
import Button from '../Button';
import styles from '../../styles/EventView.module.css';

const EventView = ({
	eventData,
	activeEventNpc,
	resolutionData, // New prop: Passed by the state manager after a choice is resolved
	onAcknowledge,
	onChoice,
}) => {
	if (!eventData) return null;

	// ========================================================================
	// PHASE 2: RESOLUTION VIEW (Shown after a choice is made)
	// ========================================================================
	if (resolutionData) {
		return (
			<div className={styles.container}>
				<h2 className={styles.title}>Result</h2>
				<p className={styles.description}>{resolutionData.resultDescription || 'The situation has been resolved.'}</p>

				{resolutionData.changes && resolutionData.changes.length > 0 && (
					<div className={styles.effectsContainer}>
						<h3 className={styles.effectsHeader}>Consequences</h3>
						{resolutionData.changes.map((change, index) => {
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
	// PHASE 1: DECISION VIEW (Initial Event Rendering)
	// ========================================================================
	return (
		<div className={styles.container}>
			{/* Map eventData.name instead of title to match the new DB */}
			<h2 className={styles.title}>{eventData.name || 'Event'}</h2>

			<p className={styles.description}>{eventData.description || 'You have encountered something on your journey.'}</p>

			{/* Render the generated NPC if this is an Encounter */}
			{activeEventNpc && (
				<div style={{ padding: '10px', margin: '15px 0', border: '1px solid #444', backgroundColor: '#111' }}>
					<div style={{ color: '#ef4444', marginBottom: '5px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Threat Detected</div>
					<div style={{ fontSize: '1.2rem', color: '#fff' }}>{activeEventNpc.entityName}</div>
					<div style={{ color: '#aaa', fontSize: '0.9rem' }}>
						Rank {activeEventNpc.classification?.entityRank} {activeEventNpc.classification?.entitySubclass}
					</div>
					<div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px', fontStyle: 'italic' }}>{activeEventNpc.entityDescription}</div>
				</div>
			)}

			{/* Render initial Static Effects (for SEE events) */}
			{eventData.changes && eventData.changes.length > 0 && (
				<div className={styles.effectsContainer}>
					<h3 className={styles.effectsHeader}>Event Effects</h3>
					{eventData.changes.map((change, index) => {
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

			{/* Dynamic Decision Buttons Section */}
			{eventData.choices && eventData.choices.length > 0 ? (
				<div className={styles.choicesContainer}>
					{eventData.choices.map((choice, index) => {
						// Display the cost inside the button if it's a trade-off
						const costText = choice.cost?.silverCoins ? ` (-${choice.cost.silverCoins} Silver)` : '';

						return (
							<Button
								key={index}
								onClick={() => onChoice(choice)}
								variant={choice.variant || 'primary'}
							>
								{choice.label}
								{costText}
							</Button>
						);
					})}
				</div>
			) : (
				<Button
					onClick={onAcknowledge}
					variant='primary'
				>
					Continue
				</Button>
			)}
		</div>
	);
};

export default EventView;

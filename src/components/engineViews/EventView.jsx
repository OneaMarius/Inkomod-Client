// File: Client/src/components/engineViews/EventView.jsx
import Button from '../Button';
import styles from '../../styles/EventView.module.css';

const EventView = ({ eventData, onAcknowledge, onChoice }) => {
    if (!eventData) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {eventData.title || 'Event'}
            </h2>

            <p className={styles.description}>
                {eventData.description || 'You have encountered something on your journey.'}
            </p>

            {/* Render Resource Changes Section */}
            {eventData.changes && eventData.changes.length > 0 && (
                <div className={styles.effectsContainer}>
                    <h3 className={styles.effectsHeader}>Event Effects</h3>

                    {eventData.changes.map((change, index) => {
                        // Analyze value to determine color formatting
                        const isPositive = typeof change.value === 'number' ? change.value > 0 : String(change.value).startsWith('+');
                        const isNegative = typeof change.value === 'number' ? change.value < 0 : String(change.value).startsWith('-');

                        // Format value to ensure the presence of the "+" sign on the UI
                        const displayValue = typeof change.value === 'number' && change.value > 0 ? `+${change.value}` : change.value;

                        let valueClass = styles.neutralValue;
                        if (isPositive) valueClass = styles.positiveValue;
                        if (isNegative) valueClass = styles.negativeValue;

                        return (
                            <div key={index} className={styles.effectRow}>
                                <span className={styles.effectLabel}>{change.label}</span>
                                <span className={valueClass}>{displayValue}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fallback for legacy 'mechanics' property */}
            {eventData.mechanics && !eventData.changes && (
                <div className={styles.mechanicsFallback}>
                    {eventData.mechanics}
                </div>
            )}

            {/* Dynamic Decision Buttons Section */}
            {eventData.choices && eventData.choices.length > 0 ? (
                <div className={styles.choicesContainer}>
                    {eventData.choices.map((choice, index) => (
                        <Button
                            key={index}
                            onClick={() => onChoice && onChoice(choice)}
                            variant={choice.variant || 'primary'}
                        >
                            {choice.label}
                        </Button>
                    ))}
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
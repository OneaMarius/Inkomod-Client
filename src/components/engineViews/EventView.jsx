// File: Client/src/components/engineViews/EventView.jsx
import Button from '../Button';

const EventView = ({ eventData, onAcknowledge, onChoice }) => {
    if (!eventData) return null;

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '8px'
        }}>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                {eventData.title || "Event"}
            </h2>
            
            <p style={{ color: '#e0e0e0', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '600px' }}>
                {eventData.description || "You have encountered something on your journey."}
            </p>

            {/* Secțiunea de randare a modificărilor de resurse */}
            {eventData.changes && eventData.changes.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '2rem',
                    padding: '1rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    minWidth: '250px'
                }}>
                    <h3 style={{ color: '#aaa', fontSize: '1rem', margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                        Event Effects
                    </h3>
                    
                    {eventData.changes.map((change, index) => {
                        // Analiza valorii pentru a determina culoarea
                        const isPositive = typeof change.value === 'number' 
                            ? change.value > 0 
                            : String(change.value).startsWith('+');
                            
                        const isNegative = typeof change.value === 'number' 
                            ? change.value < 0 
                            : String(change.value).startsWith('-');
                        
                        // Formatarea valorii pentru a asigura prezența semnului "+" pe UI
                        const displayValue = (typeof change.value === 'number' && change.value > 0) 
                            ? `+${change.value}` 
                            : change.value;

                        let textColor = '#e0e0e0'; // Neutru
                        if (isPositive) textColor = '#4caf50'; // Verde
                        if (isNegative) textColor = '#f44336'; // Roșu

                        return (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                <span style={{ color: '#ccc' }}>{change.label}</span>
                                <span style={{ color: textColor }}>{displayValue}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fallback pentru proprietatea veche 'mechanics' */}
            {eventData.mechanics && !eventData.changes && (
                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #444', 
                    backgroundColor: '#1a1a1a', 
                    marginBottom: '2rem',
                    color: '#aaa',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    {eventData.mechanics}
                </div>
            )}

            {/* Secțiunea butoanelor de decizie dinamice */}
            {eventData.choices && eventData.choices.length > 0 ? (
                <div style={{ display: 'flex', gap: '15px', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                <Button onClick={onAcknowledge} variant="primary">
                    Continue
                </Button>
            )}
        </div>
    );
};

export default EventView;
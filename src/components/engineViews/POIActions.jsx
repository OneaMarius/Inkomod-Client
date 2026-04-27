import { formatForUI } from '../../utils/NameFormatter.js';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';

const POIActions = ({ actionTags, player, doInteraction, regionalExchangeRate }) => {
    const completedQuests = player?.progression?.completedQuests || [];

    // Filter tags: 
    // 1. Remove navigation tags
    // 2. Remove tags that are already in the completedQuests array
    const specialTags = actionTags?.filter((tag) => {
        const isNavigation = tag === 'Enter_Location' || tag === 'Exit_Location';
        const isCompleted = completedQuests.includes(tag);
        return !isNavigation && !isCompleted;
    }) || [];

    // 2. Return nothing if no special actions exist
    if (specialTags.length === 0) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', border: '1px dashed #fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
            <h3 style={{ color: '#fbbf24', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', fontFamily: '"VT323", monospace' }}>
                Location Actions
            </h3>
            {specialTags.map(tag => {
                const actionDef = DB_INTERACTION_ACTIONS[tag];
                if (!actionDef) return null;
                
                return (
                    <button
                        key={tag}
                        onClick={() => doInteraction(tag, null, regionalExchangeRate)}
                        style={{ 
                            padding: '12px', 
                            fontSize: '1.3rem', 
                            fontFamily: '"VT323", monospace', 
                            cursor: 'pointer', 
                            backgroundColor: '#111', 
                            color: '#fbbf24', 
                            border: '1px solid #fbbf24', 
                            textTransform: 'uppercase',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.target.style.backgroundColor = '#fbbf24'; e.target.style.color = '#000'; }}
                        onMouseOut={(e) => { e.target.style.backgroundColor = '#111'; e.target.style.color = '#fbbf24'; }}
                    >
                        {formatForUI(actionDef.actionName || actionDef.id)}
                    </button>
                );
            })}
        </div>
    );
};

export default POIActions;
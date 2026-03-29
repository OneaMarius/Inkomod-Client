// File: Client/src/engine/ENGINE_EventSpawner.js
// Description: Parses event procGen instructions and funnels them into the generation engines.

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';
import { formatEntityForCombat } from '../utils/EntityFormatter.js';
import { getRandomInt, getRandomElement } from '../utils/RandomUtils.js';

export const generateEventEncounter = (procGenData, currentZoneEconomyLevel) => {
    if (!procGenData || procGenData.type !== 'NPC_HUMAN') return null;

    const { categories = [], classes = [], subclasses = [], rankModifier = 0 } = procGenData;
    let selectedSubclass = null;

    // 1. FILTER FUNNEL LOGIC
    if (subclasses.length > 0) {
        // Level 1: Highly Specific (Subclass array is populated)
        selectedSubclass = getRandomElement(subclasses);
    } 
    else if (classes.length > 0) {
        // Level 2: Medium Specificity (Class array is populated, pull all child subclasses)
        const pool = [];
        categories.forEach(category => {
            const taxonomyCategory = DB_NPC_TAXONOMY[category];
            if (taxonomyCategory && taxonomyCategory.subclasses) {
                classes.forEach(cls => {
                    if (taxonomyCategory.subclasses[cls]) {
                        pool.push(...taxonomyCategory.subclasses[cls]);
                    }
                });
            }
        });
        selectedSubclass = getRandomElement(pool);
    } 
    else if (categories.length > 0) {
        // Level 3: Broad Selection (Only categories provided, pull ALL child subclasses)
        const pool = [];
        categories.forEach(category => {
            const taxonomyCategory = DB_NPC_TAXONOMY[category];
            if (taxonomyCategory && taxonomyCategory.subclasses) {
                Object.values(taxonomyCategory.subclasses).forEach(subclassArray => {
                    pool.push(...subclassArray);
                });
            }
        });
        selectedSubclass = getRandomElement(pool);
    }

    // Fallback safeguard
    if (!selectedSubclass) {
        console.warn('ENGINE_EventSpawner: Failed to resolve subclass from procGen funnel. Defaulting to Thug.');
        selectedSubclass = 'Thug';
    }

    // 2. RANK CALCULATION & CLAMPING
    // Apply organic variance (-1 to +1) over the base economy level, plus any explicit event modifiers
    const variance = getRandomInt(-1, 1);
    let rawRank = currentZoneEconomyLevel + variance + rankModifier;

    // Clamp the final rank between 1 and 5 (preventing bounds errors in trainingCaps)
    const finalRank = Math.max(1, Math.min(5, rawRank));

    // 3. EXECUTE GENERATION & FORMATTING
    try {
        const rawNpcData = generateHumanNPC(selectedSubclass, finalRank);
        return formatEntityForCombat(rawNpcData);
    } catch (error) {
        console.error(`ENGINE_EventSpawner: Failed to generate NPC [${selectedSubclass}] at rank [${finalRank}]`, error);
        return null;
    }
};
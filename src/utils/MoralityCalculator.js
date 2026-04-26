// File: Client/src/utils/MoralityCalculator.js
import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';

/**
 * Calculează modificările dinamice de onoare și renume pe baza categoriei și clasei inamicului.
 * @param {Object} enemyEntity - Entitatea inamicului (din state sau event).
 * @param {string} combatType - Tipul luptei ('DMF', 'NF', 'FF').
 * @returns {Object} { honorChange, renownChange, crimeLabel }
 */
export const calculateCombatMorality = (enemyEntity, combatType) => {
	const defaultResult = { honorChange: 0, renownChange: 0, crimeLabel: null };

	if (!enemyEntity || !enemyEntity.classification) return defaultResult;

	const category = enemyEntity.classification.entityCategory;
	let entityClass = enemyEntity.classification.entityClass; // Folosim 'let' pentru a o putea corecta
	const entitySubclass = enemyEntity.classification.entitySubclass; // Numele animalului (ex: 'Deer', 'Wolf')

	const isLethal = combatType === 'DMF';
	const outcomeKey = isLethal ? 'lethal' : 'nonLethal';

	const config = WORLD.MORALITY.combatConsequences;
	const categoryConfig = config[category];

	if (!categoryConfig) return defaultResult;

	let finalConfig = null;

	if (category === 'Human') {
		finalConfig = categoryConfig[entityClass] || categoryConfig.DEFAULT_CIVILIAN;
	} else if (category === 'Animal') {
		// --- FAILSAFE: Corectăm clasa generică 'Wild' folosind Taxonomia ---
		if (entityClass === 'Wild' && entitySubclass) {
			const isHostile = DB_NPC_TAXONOMY.Animal.subclasses.WildHostile?.includes(entitySubclass);
			const isFriendly = DB_NPC_TAXONOMY.Animal.subclasses.WildFriendly?.includes(entitySubclass);

			if (isHostile) {
				entityClass = 'WildHostile';
			} else if (isFriendly) {
				entityClass = 'WildFriendly';
			}
		}

		finalConfig = categoryConfig[entityClass] || categoryConfig.WildHostile;
	} else {
		// Monster și Nephilim
		finalConfig = categoryConfig.DEFAULT;
	}

	if (!finalConfig || !finalConfig[outcomeKey]) return defaultResult;
// --- DEBUG MORALITATE ---
    console.log(`[DEBUG 1 - MORALITATE] Inamic: ${entitySubclass || entityClass} | CombatType: ${combatType}`);
    console.log(`[DEBUG 1 - MORALITATE] Modificatori extrași:`, finalConfig[outcomeKey]);
	return finalConfig[outcomeKey];
};

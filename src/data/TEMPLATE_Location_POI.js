// File: src/data/TEMPLATE_Location_POI.js
// Description: Blueprint for static and dynamic Points of Interest (POIs) within zones.

/**
 * POI GENERATION REFERENCE GUIDE
 * ============================================================================
 * classification.poiArchetype: 'Location'
 * classification.poiCategory:  ['Static', 'Dynamic']
 * classification.poiClass:     ['Sector', 'Wild', 'Orbit', 'Edge']
 * classification.poiSubclass:  [Varies based on class]
 * classification.poiRank:      Integer (1 - 5)
 * classification.locationSpawnChance: Integer (0 - 100 percentage. 100 for Static)
 * spawns.guaranteed:           [String] (Array of guaranteed subclasses)
 * spawns.dynamic.maxCapacity:  Integer (Maximum random NPCs to generate per POI entry)
 * spawns.dynamic.pool:         [{ npcClass: String, classSpawnChance: Integer }]
 * interactions.actionTags:     ['Enter_Location', 'Exit_Location']
 * ============================================================================
 */

export const POI_TEMPLATE = {
	poiId: '', // Unique identifier (UUID) generated at runtime
	poiName: '', // Procedural or fixed name
	poiDescription: '', // Narrative text for UI

	classification: {
		poiArchetype: 'Location',
		poiCategory: '', // 'Static' or 'Dynamic'
		poiClass: '', // 'Wild', 'Orbit', 'Edge'
		poiSubclass: '', // e.g., 'Bandit_Camp', 'Howling_Ridge'
		poiRank: 1, // Scales with the danger/economy of the wilderness zone
		locationSpawnChance: 100, // Probability of this POI existing when the zone is loaded
	},

	spawns: { guaranteed: [], dynamic: { maxCapacity: 0, pool: [] } },

	interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
};

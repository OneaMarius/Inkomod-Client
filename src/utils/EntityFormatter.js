// File: Client/src/utils/EntityFormatter.js
// Description: Utility functions for formatting raw generated entities for the combat engine.

export const formatEntityForCombat = (generatedData) => {
	const { entity, generatedItems = [] } = generatedData;

	if (!entity) return null;

	// DEFENSIVE CHECK: Animals/Monsters don't have equipment objects.
	// We provide a fallback to prevent "Cannot read property of undefined" crashes.
	const equipment = entity.equipment || { weaponId: null, armorId: null, shieldId: null, helmetId: null, mountId: null };

	let totalAd = 0;
	let totalDr = 0;

	// Calculate bonuses from generated physical items (if any)
	if (generatedItems && generatedItems.length > 0) {
		generatedItems.forEach((item) => {
			const isEquipped =
				item.entityId === equipment.weaponId ||
				item.entityId === equipment.armorId ||
				item.entityId === equipment.shieldId ||
				item.entityId === equipment.helmetId;

			if (isEquipped && item.stats) {
				if (item.stats.adp) totalAd += item.stats.adp;
				if (item.stats.ddr) totalDr += item.stats.ddr;
			}
		});
	}

	// Standardize Stats:
	// Humans use innateStr/Agi/Int.
	// Animals/Monsters use innateStr/Agi/Int as well.
	// 'ad' and 'dr' are the final derived values used by the Combat Engines.
	entity.stats = {
		...entity.stats,
		str: entity.stats?.innateStr || 10,
		agi: entity.stats?.innateAgi || 10,
		int: entity.stats?.innateInt || 10,
		ad: (entity.stats?.innateAdp || 0) + totalAd,
		dr: (entity.stats?.innateDdr || 0) + totalDr,
	};

	// Format Equipment status
	entity.equipment = {
		...equipment,
		hasWeapon: !!equipment.weaponId,
		hasArmor: !!equipment.armorId,
		hasShield: !!equipment.shieldId,
		hasHelmet: !!equipment.helmetId,
	};

	// Ensure inventory exists and contains the generated physical items
	entity.inventory = { ...entity.inventory, itemSlots: generatedItems };

	return entity;
};

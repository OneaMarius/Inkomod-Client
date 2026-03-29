// File: Client/src/utils/EntityFormatter.js
// Description: Utility functions for formatting raw generated entities for the combat engine.

export const formatEntityForCombat = (generatedData) => {
    const { entity, generatedItems } = generatedData;

    let totalAd = 0;
    let totalDr = 0;

    if (generatedItems && generatedItems.length > 0) {
        generatedItems.forEach((item) => {
            const isEquipped =
                item.entityId === entity.equipment.weaponId ||
                item.entityId === entity.equipment.armourId ||
                item.entityId === entity.equipment.shieldId ||
                item.entityId === entity.equipment.helmetId;

            if (isEquipped && item.stats) {
                if (item.stats.adp) totalAd += item.stats.adp;
                if (item.stats.ddr) totalDr += item.stats.ddr;
            }
        });
    }

    entity.stats = {
        ...entity.stats,
        str: entity.stats.innateStr || 10,
        agi: entity.stats.innateAgi || 10,
        int: entity.stats.innateInt || 10,
        ad: (entity.stats.innateAdp || 0) + totalAd,
        dr: (entity.stats.innateDdr || 0) + totalDr,
    };

    entity.equipment = {
        ...entity.equipment,
        hasWeapon: !!entity.equipment.weaponId,
        hasArmour: !!entity.equipment.armourId,
        hasShield: !!entity.equipment.shieldId,
        hasHelmet: !!entity.equipment.helmetId,
    };

    entity.inventory = { ...entity.inventory, itemSlots: generatedItems };

    return entity;
};
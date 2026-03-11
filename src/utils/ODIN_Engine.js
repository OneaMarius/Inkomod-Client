import { THOR_Constants } from './THOR_Engine';

export const ODIN_Constants = {
    Biology: {
        Base_Player_Carry_Weight: 50,
        Variable_Player_Carry_Weight: 5,
        Encumbrance_Threshold_Pct: 0.5,
        Base_Mount_Carry_Weight: 50,
        Tier_Mount_Carry_Weight_Bonus: 2,
    }
};

export const ODIN_Formulas = {
    Calculate_Mass_And_Encumbrance: (gameState) => {
        const inv = gameState.player.inventory;
        const biology = gameState.player.biology;
        const equipped = gameState.player.equipped;
        const THOR_C = THOR_Constants;
        const ODIN_Bio = ODIN_Constants.Biology;

        // 1. Raw Resources
        const coinsMass = Math.ceil(inv.silverCoins / THOR_C.Mass_Ratios.Silver_Coins);
        const foodMass = Math.ceil(inv.food / THOR_C.Mass_Ratios.Food);
        const goldMass = inv.gold * THOR_C.Mass_Constants.Commodity_GOLD;
        const silverMass = inv.silver * THOR_C.Mass_Constants.Commodity_SILVER;

        // 2. Inventory Items
        let itemsMass = 0;
        inv.items.forEach((item) => {
            const iClass = item.classification?.itemClass;
            if (THOR_C.Mass_Constants[iClass]) itemsMass += THOR_C.Mass_Constants[iClass];
        });

        // 3. Equipped Gear
        const equippedGear = ['weapon', 'shield', 'armour', 'helmet'];
        equippedGear.forEach((slot) => {
            if (equipped[slot]) {
                const eClass = equipped[slot].classification?.itemClass;
                if (THOR_C.Mass_Constants[eClass]) itemsMass += THOR_C.Mass_Constants[eClass];
            }
        });

        const currentMass = coinsMass + foodMass + goldMass + silverMass + itemsMass;

        // 4. Maximum Capacity Calculation
        const baseCap = ODIN_Bio.Base_Player_Carry_Weight;
        const strBonus = biology.str * ODIN_Bio.Variable_Player_Carry_Weight;

        let caravanBonus = 0;
        if (equipped.mount) {
            caravanBonus += ODIN_Bio.Base_Mount_Carry_Weight + (equipped.mount.biology.str * ODIN_Bio.Tier_Mount_Carry_Weight_Bonus);
        }
        
        inv.animals.forEach((animal) => {
            if (animal.classification?.itemClass === 'Mount') {
                caravanBonus += ODIN_Bio.Base_Mount_Carry_Weight + (animal.biology.str * ODIN_Bio.Tier_Mount_Carry_Weight_Bonus);
            }
        });

        const totalPlayerCarryWeight = baseCap + strBonus + caravanBonus;

        // 5. Dynamic AP Penalty Calculation
        const thresholdWeight = totalPlayerCarryWeight * ODIN_Bio.Encumbrance_Threshold_Pct;
        let encumbrancePenaltyAP = 0;
        
        if (thresholdWeight > 0) {
            encumbrancePenaltyAP = Math.floor(currentMass / thresholdWeight);
        }

        return { 
            currentMass, 
            totalPlayerCarryWeight, 
            encumbrancePenaltyAP 
        };
    }
};
// File: src/engine/ENGINE_Time_Loop.js
import { WORLD } from '../data/GameWorld.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// HELPER FORMULAS
// ------------------------------------------------------------------------

const determineSeason = (month) => {
    const seasons = WORLD.TIME.seasons;
    if (month >= seasons.spring.startMonth && month <= seasons.spring.endMonth)
        return 'spring';
    if (month >= seasons.summer.startMonth && month <= seasons.summer.endMonth)
        return 'summer';
    if (month >= seasons.autumn.startMonth && month <= seasons.autumn.endMonth)
        return 'autumn';
    return 'winter';
};

const resolveBiologicalMatrix = (playerEntity, seasonKey) => {
    const seasonMult = WORLD.TIME.seasons[seasonKey].foodConsumptionMult;
    
    // Constante Player
    const playerStarvingDmg = WORLD.PLAYER.healingRates?.starving || -25;
    const playerNaturalHeal = WORLD.PLAYER.healingRates?.standard || 25;
    
    // Constante Animale
    const animalStarvingDmg = WORLD.NPC?.ANIMAL?.healingRates?.starving || -25;
    const animalNaturalHeal = WORLD.NPC?.ANIMAL?.healingRates?.natural || 5;
    
    const deathMultiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.death || 0.5;

    let availableFood = playerEntity.inventory.food || 0;
    let totalFoodConsumed = 0;

    // Funcție utilitară pentru a sacrifica cel mai slab animal din caravană
    const sacrificeWeakestAnimal = () => {
        const animals = playerEntity.inventory.animalSlots;
        if (!animals || animals.length === 0) return 0;

        let minHpIndex = 0;
        let minHp = animals[0].biology.hpCurrent;
        for (let i = 1; i < animals.length; i++) {
            if (animals[i].biology.hpCurrent < minHp) {
                minHp = animals[i].biology.hpCurrent;
                minHpIndex = i;
            }
        }

        const sacrificedAnimal = animals[minHpIndex];
        const baseYield = sacrificedAnimal.logistics?.foodYield || 10; // Fallback de siguranță
        const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier)); // Minim 1 food garantat

        animals.splice(minHpIndex, 1);
        return meatYield;
    };

    // ========================================================================
    // 1. RESOLVE PLAYER (Prioritate Maximă)
    // ========================================================================
    const playerBaseReq = WORLD.PLAYER.baseFoodNeed || 2;
    const playerReq = Math.ceil(playerBaseReq * seasonMult);

    // Comparăm ÎNAINTE să consumăm: dacă nu ajunge, sacrificăm.
    while (availableFood < playerReq && playerEntity.inventory.animalSlots.length > 0) {
        availableFood += sacrificeWeakestAnimal();
    }

    if (availableFood >= playerReq) {
        // Avem suficientă mâncare
        availableFood -= playerReq;
        totalFoodConsumed += playerReq;
        
        playerEntity.biology.isStarving = false;
        playerEntity.biology.hpCurrent = Math.min(
            playerEntity.biology.hpMax,
            playerEntity.biology.hpCurrent + playerNaturalHeal
        );
    } else {
        // Au murit toate animalele și tot nu ajunge mâncarea
        totalFoodConsumed += availableFood; // Mănâncă resturile
        availableFood = 0;
        
        playerEntity.biology.isStarving = true;
        playerEntity.biology.hpCurrent += playerStarvingDmg; // Aplicăm damage
        
        if (playerEntity.biology.hpCurrent <= 0) return { status: 'PERMADEATH' };
    }

    // ========================================================================
    // 2. RESOLVE EQUIPPED MOUNT (Prioritate Secundară)
    // ========================================================================
    if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
        const mount = playerEntity.equipment.mountItem;
        const mountReq = Math.ceil((mount.logistics?.foodConsumption || 1) * seasonMult);

        // Verificăm dacă ajunge pentru Mount. Dacă nu, continuăm sacrificiile din Caravană.
        while (availableFood < mountReq && playerEntity.inventory.animalSlots.length > 0) {
            availableFood += sacrificeWeakestAnimal();
        }

        if (availableFood >= mountReq) {
            // Mount-ul este hrănit
            availableFood -= mountReq;
            totalFoodConsumed += mountReq;
            
            mount.biology.hpCurrent = Math.min(
                mount.biology.hpMax,
                mount.biology.hpCurrent + animalNaturalHeal
            );
        } else {
            // Nu mai sunt animale în caravană de sacrificat, mount-ul suferă
            totalFoodConsumed += availableFood;
            availableFood = 0;
            
            mount.biology.hpCurrent += animalStarvingDmg;
            
            if (mount.biology.hpCurrent <= 0) {
                // Mount-ul moare și devine el însuși mâncare
                const baseYield = mount.logistics?.foodYield || 10;
                const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));
                availableFood += meatYield;
                
                playerEntity.equipment.mountItem = null;
                playerEntity.equipment.hasMount = false;
            }
        }
    }

    // ========================================================================
    // 3. RESOLVE CARAVAN (Restul resurselor)
    // ========================================================================
    if (playerEntity.inventory.animalSlots && playerEntity.inventory.animalSlots.length > 0) {
        playerEntity.inventory.animalSlots = playerEntity.inventory.animalSlots.filter((animal) => {
            const animalReq = Math.ceil((animal.logistics?.foodConsumption || 1) * seasonMult);
            
            if (availableFood >= animalReq) {
                // Animalul este hrănit
                availableFood -= animalReq;
                totalFoodConsumed += animalReq;
                
                animal.biology.hpCurrent = Math.min(
                    animal.biology.hpMax,
                    animal.biology.hpCurrent + animalNaturalHeal
                );
                return true;
            } else {
                // Hrana s-a terminat, animalele de la coadă iau damage
                totalFoodConsumed += availableFood;
                availableFood = 0;
                
                animal.biology.hpCurrent += animalStarvingDmg;
                
                if (animal.biology.hpCurrent <= 0) {
                    // Dacă moare de foame, carnea lui devine hrana disponibilă pentru URMĂTORUL
                    const baseYield = animal.logistics?.foodYield || 10;
                    const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));
                    availableFood += meatYield; 
                    
                    return false; // Este scos din array
                }
                return true; // Supraviețuiește pe minus HP
            }
        });
    }

    // Setăm hrana finală rămasă jucătorului
    playerEntity.inventory.food = availableFood;

    return { status: 'SURVIVED', foodConsumed: totalFoodConsumed };
};

// ------------------------------------------------------------------------
// MAIN EXECUTION LOOP
// ------------------------------------------------------------------------

export const executeEndMonth = (playerEntity, timeState) => {
    timeState.currentMonth += 1;
    timeState.totalMonthsPassed += 1;

    let isNewYear = false;
    if (timeState.currentMonth > WORLD.TIME.monthsPerYear) {
        timeState.currentMonth = 1;
    }

    if (timeState.currentMonth === WORLD.TIME.yearChangeMonth) {
        playerEntity.identity.age += 1;
        isNewYear = true;
    }

    timeState.activeSeason = determineSeason(timeState.currentMonth);

    if (isNewYear) {
        // Degradare staturi la schimbarea anului
    }

    const bioResolution = resolveBiologicalMatrix(
        playerEntity,
        timeState.activeSeason,
    );

    if (bioResolution.status === 'PERMADEATH') {
        return {
            status: 'PERMADEATH',
            reason: 'Starvation',
            updatedPlayer: playerEntity,
            updatedTime: timeState,
        };
    }

    playerEntity.progression.actionPoints = WORLD.PLAYER.maxAp;
    recalculateEncumbrance(playerEntity);

    return {
        status: 'SUCCESS',
        foodConsumed: bioResolution.foodConsumed,
        updatedPlayer: playerEntity,
        updatedTime: timeState,
    };
};
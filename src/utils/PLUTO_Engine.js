import { PLUTO_Global_Grid, PLUTO_Global_Gates } from '../data/PLUTO_GOD_World_Data';

export const PLUTO_Constants = {
    AP_Transit_Mount_Factor: 0.5,
    AP_Transit_Encumbered_Penalty: 2, 
};

export const PLUTO_Formulas = {
    Get_Node_Data: (targetWorldID) => {
        return PLUTO_Global_Grid.find((node) => node.World_ID === targetWorldID);
    },

    Get_Gate_Data: (Current_World_ID, Target_World_ID) => {
        return PLUTO_Global_Gates.find(
            (gate) =>
                (gate.Gate_Zone_1 === Current_World_ID && gate.Gate_Zone_2 === Target_World_ID) ||
                (gate.Gate_Zone_2 === Current_World_ID && gate.Gate_Zone_1 === Target_World_ID),
        );
    },

    Calculate_Global_Transit_Cost: (gameState, Target_World_ID) => {
        const Target_Zone = PLUTO_Formulas.Get_Node_Data(Target_World_ID);
        const Transit_Gate = PLUTO_Formulas.Get_Gate_Data(
            gameState.location.currentWorldId,
            Target_World_ID,
        );

        if (!Target_Zone || !Transit_Gate) return 999;

        const Base_Cost = Target_Zone.Cost_AP + Transit_Gate.Cost_AP;
        const Season_Bonus = gameState.time.currentSeasonModifier?.Transit_AP_Bonus || 0;
        const Encumbrance_Penalty = gameState.player.inventory.isEncumbered ? PLUTO_Constants.AP_Transit_Encumbered_Penalty : 0;

        let Mount_Factor = 1.0;
        if (gameState.player.equipped.mount) {
            Mount_Factor = PLUTO_Constants.AP_Transit_Mount_Factor;
        }

        const Raw_Calculation = Math.ceil(
            (Base_Cost + Season_Bonus + Encumbrance_Penalty) * Mount_Factor
        );

        return Math.max(1, Raw_Calculation);
    },

    Get_Available_Routes: (gameState) => {
        const Current_World_ID = gameState.location.currentWorldId;
        const Player_AP = gameState.player.biology.currentAp;
        const Player_Coins = gameState.player.inventory.silverCoins;
        const Available_Routes = [];

        const Connected_Gates = PLUTO_Global_Gates.filter(
            (gate) =>
                gate.Gate_Zone_1 === Current_World_ID ||
                gate.Gate_Zone_2 === Current_World_ID,
        );

        Connected_Gates.forEach((gate) => {
            const Target_World_ID =
                gate.Gate_Zone_1 === Current_World_ID
                    ? gate.Gate_Zone_2
                    : gate.Gate_Zone_1;
            
            const Target_Zone = PLUTO_Formulas.Get_Node_Data(Target_World_ID);

            if (Target_Zone) {
                const Total_AP_Required = PLUTO_Formulas.Calculate_Global_Transit_Cost(
                    gameState,
                    Target_World_ID,
                );
                
                const Total_Coin_Required = gate.Cost_Coin + Target_Zone.Cost_Coin;
                const Is_Accessible = Player_AP >= Total_AP_Required && Player_Coins >= Total_Coin_Required;

                Available_Routes.push({
                    Destination_ID: Target_Zone.World_ID,
                    Destination_Name: Target_Zone.Zone_Name,
                    Zone_Class: Target_Zone.Zone_Class,
                    Zone_Category: Target_Zone.Zone_Category,
                    Economy_Level: Target_Zone.Zone_Economy_Level,
                    Gate_Name: gate.Gate_Name,
                    Transit_Type: gate.Gate_Category,
                    Total_AP_Cost: Total_AP_Required,
                    Total_Coin_Cost: Total_Coin_Required,
                    Is_Accessible: Is_Accessible,
                });
            }
        });

        return Available_Routes;
    }
};
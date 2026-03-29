# Narrative and Event System Architecture (SEE & DEE)

## 1. Engine Classification

The system utilizes two distinct processing units:

- **SEE (Static Event Engine):** Processes non-interactive events. Executes the `staticEffects` payload immediately upon rendering.
- **DEE (Dynamic Event Engine):** Processes interactive events via a decision matrix (`choices`). Evaluates logic based on player input.

## 2. Encounter Generation (Root Level)

For `Encounter` typology events, NPC generation occurs _before_ choices are rendered, ensuring the UI can display the opponent's data.

- Defined in the `onEncounter.procGen` object.
- **Funnel Filtering System:**
   1. `subclasses`: If populated, picks randomly from this array (Specific).
   2. `classes`: If `subclasses` is empty, pools all subclasses belonging to these classes and picks one (Medium).
   3. `categories`: If both above are empty, pools all subclasses under these categories (Broad).
- **Rank Calculation:** `Final Rank = Clamp(Zone_Economy_Level + RNG(-1, 1) + rankModifier, 1, 5)`. This ensures organic difficulty variance while preventing out-of-bounds array errors in the training caps.
- The generated NPC is formatted via `formatEntityForCombat` and stored in the State Manager (`activeEventNpc`).

## 3. Resolution Matrix (DEE Checks)

Event choices define the resolution algorithm via the `checkType` parameter:

- **TRADE_OFF:** Guaranteed transaction. Subtracts `cost` and applies `onSuccess`.
- **LUCK_CHECK:** Pure RNG roll against `successChance`.
- **SKILL_CHECK:** Compares a player attribute (e.g., `str`, `agi`) against a Difficulty Class (DC). DC is calculated using the generated NPC's rank adjusted by `difficultyModifier`.
- **COMBAT:** Suspends event rendering. Triggers the Combat Engine using the `activeEventNpc` stored in the state.

## 4. State Management Integration (OMD_State_Manager)

To handle asynchronous resolution (e.g., returning from Combat):

- When COMBAT is selected, the state manager caches the `onSuccess` and `onFailure` payloads.
- Upon combat termination, `exitCombatEncounterView` evaluates the combat outcome (Victory/Defeat) and injects the corresponding cached payload into the player's entity state before clearing the context memory.

## 5. Implementation Roadmap

1. **Data Layer:** Deploy `DB_Events.js` utilizing the universal template structure.
2. **Utilities:** \* `utils/eventProbability.js`: Calculates local spawn chances based on Zone Taxonomy and Season.
   - `ENGINE_EventSpawner.js`: Executes the funnel filtering system and generates the NPC.
3. **Core Engine:** Update `ENGINE_Events.js` to parse `checkType` logic and interface with `ENGINE_EventSpawner`.
4. **UI Layer:** Adapt `EventView.jsx` to intercept choice selections and display immediate results (Skill/Luck/Trade) before dismissal.
5. **State Layer:** Update `OMD_State_Manager.js` to store `activeEventNpc` and process asynchronous combat payloads.

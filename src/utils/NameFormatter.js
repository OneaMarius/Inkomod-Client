// File: Client/src/utils/NameFormatter.js

/**
 * Convertește un nume din UI (cu spații) într-o cheie validă pentru DB (cu underscore).
 * Ex: "Water Buffalo" -> "Water_Buffalo"
 */
export const formatForDB = (name) => {
    if (!name) return name;
    return name.replace(/ /g, '_');
};

/**
 * Convertește o cheie din DB (cu underscore) într-un text lizibil pentru UI (cu spații).
 * Ex: "Water_Buffalo" -> "Water Buffalo"
 */
export const formatForUI = (name) => {
    if (!name) return name;
    return name.replace(/_/g, ' ');
};
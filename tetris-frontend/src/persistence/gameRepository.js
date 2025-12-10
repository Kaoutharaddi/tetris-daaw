import { db } from "./firebase";
import { ref, set, onValue, off, remove, onDisconnect, get, push } from "firebase/database";

// ==================== GESTIÓN DE JUGADORES ====================

/**
 * Verifica si un nombre de usuario ya está en uso
 */
export async function checkPlayerNameExists(playerName) {
    const playerRef = ref(db, `players/${playerName}`);
    const snapshot = await get(playerRef);
    return snapshot.exists();
}
/**
 * Registra un jugador en el lobby
 */
export async function registerPlayer(playerName) {
    const playerRef = ref(db, `players/${playerName}`);
    await set(playerRef, {
        name: playerName,
        connected: true,
        joinedAt: Date.now(),
        lines: 0,
        level: 1,
        gameOver: false
    });
    
    // Configurar eliminación automática al desconectarse
    onDisconnect(playerRef).remove();
    
    return playerRef;
}

/**
 * Elimina un jugador del lobby
 */
export async function removePlayer(playerName) {
    const playerRef = ref(db, `players/${playerName}`);
    await remove(playerRef);
}

/**
 * Escucha cambios en la lista de jugadores conectados
 */
export function attachPlayersListener(onDataFunction, onErrorFunction) {
    const playersRef = ref(db, "players");
    
    const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        onDataFunction(data ?? {});
    };
    
    onValue(playersRef, handleDataChange, onErrorFunction);
    
    return function detachPlayersListener() {
        off(playersRef, "value", handleDataChange);
    };
}

/**
 * Actualiza el estado de un jugador (líneas, nivel, gameOver)
 */
export async function updatePlayerState(playerName, state) {
    const playerRef = ref(db, `players/${playerName}`);
    const currentSnapshot = await get(playerRef);
    const currentData = currentSnapshot.val() || {};
    await set(playerRef, { ...currentData, ...state });
}

// ==================== ESTADO GLOBAL DEL JUEGO ====================

/**
 * Establece el estado global del juego (started, paused, gameOver)
 */
export async function setGameState(state) {
    const gameStateRef = ref(db, "gameState");
    await set(gameStateRef, {
        ...state,
        updatedAt: Date.now()
    });
}

/**
 * Obtiene el estado actual del juego
 */
export async function getGameState() {
    const gameStateRef = ref(db, "gameState");
    const snapshot = await get(gameStateRef);
    return snapshot.val();
}

/**
 * Escucha cambios en el estado global del juego
 */
export function attachGameStateListener(onDataFunction, onErrorFunction) {
    const gameStateRef = ref(db, "gameState");
    
    const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        onDataFunction(data ?? { started: false, paused: false, gameOver: false });
    };
    
    onValue(gameStateRef, handleDataChange, onErrorFunction);
    
    return function detachGameStateListener() {
        off(gameStateRef, "value", handleDataChange);
    };
}

// ==================== SISTEMA DE ATAQUES ====================

/**
 * Envía un ataque a todos los demás jugadores
 */
export async function sendAttack(fromPlayer, linesCount) {
    const attackRef = ref(db, "attacks");
    await push(attackRef, {
        from: fromPlayer,
        lines: linesCount,
        timestamp: Date.now()
    });
}

/**
 * Escucha ataques entrantes
 */
export function attachAttacksListener(onDataFunction, onErrorFunction) {
    const attacksRef = ref(db, "attacks");
    
    const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        onDataFunction(data ?? {});
    };
    
    onValue(attacksRef, handleDataChange, onErrorFunction);
    
    return function detachAttacksListener() {
        off(attacksRef, "value", handleDataChange);
    };
}

/**
 * Limpia un ataque procesado
 */
export async function clearAttack(attackId) {
    const attackRef = ref(db, `attacks/${attackId}`);
    await remove(attackRef);
}

/**
 * Limpia todos los ataques (al iniciar nueva partida)
 */
export async function clearAllAttacks() {
    const attacksRef = ref(db, "attacks");
    await remove(attacksRef);
}

// ==================== RESULTADOS DE PARTIDA ====================

/**
 * Guarda los resultados de la última partida
 */
export async function saveLastGameResults(results) {
    const resultsRef = ref(db, "lastGameResults");
    await set(resultsRef, {
        results: results,
        finishedAt: Date.now()
    });
}

/**
 * Obtiene los resultados de la última partida
 */
export async function getLastGameResults() {
    const resultsRef = ref(db, "lastGameResults");
    const snapshot = await get(resultsRef);
    return snapshot.val();
}

/**
 * Escucha cambios en los resultados de la última partida
 */
export function attachLastGameResultsListener(onDataFunction, onErrorFunction) {
    const resultsRef = ref(db, "lastGameResults");
    
    const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        onDataFunction(data);
    };
    
    onValue(resultsRef, handleDataChange, onErrorFunction);
    
    return function detachLastGameResultsListener() {
        off(resultsRef, "value", handleDataChange);
    };
}

// ==================== RESET DE PARTIDA ====================

/**
 * Reinicia el estado del juego para una nueva partida
 */
export async function resetGameForNewMatch() {
    await setGameState({ started: false, paused: false, gameOver: false });
    await clearAllAttacks();
    
    // Resetear estados de jugadores
    const playersRef = ref(db, "players");
    const snapshot = await get(playersRef);
    const players = snapshot.val() || {};
    
    for (const playerName of Object.keys(players)) {
        await updatePlayerState(playerName, {
            lines: 0,
            level: 1,
            gameOver: false
        });
    }
}

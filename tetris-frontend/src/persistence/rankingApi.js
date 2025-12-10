// URL base del servidor Spring Boot
// Cambiar según el entorno de despliegue
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Obtiene el ranking histórico de puntuaciones
 */
export async function getRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return [];
    }
}

/**
 * Registra una nueva puntuación en el ranking
 */
export async function postScore(playerName, level, lines) {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nombre: playerName,
                nivel: level,
                lineas: lines
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error posting score:", error);
        return null;
    }
}

import { useState, useEffect } from "react";
import { checkPlayerNameExists } from "../persistence/gameRepository"; 

const Login = ({ onLogin }) => {
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState(""); // Estado para el mensaje de error
    const [isChecking, setIsChecking] = useState(false); // Estado de carga

    // Cargar nombre guardado del localStorage
    useEffect(() => {
        const savedName = localStorage.getItem("tetrisPlayerName");
        if (savedName) {
            setPlayerName(savedName);
        }
    }, []);

    const handleSubmit = async (e) => { // Ahora es async
        e.preventDefault();
        setError(""); // Limpiar errores previos
        
        const nameToUse = playerName.trim();

        if (nameToUse) {
            setIsChecking(true); // Activar spinner/bloqueo
            
            try {
                // 1. Verificar si existe en Firebase
                const exists = await checkPlayerNameExists(nameToUse);
                
                if (exists) {
                    setError("⚠️ Este nombre ya está en uso. Elige otro.");
                    setIsChecking(false);
                    return; // Detener el proceso
                }

                // 2. Si no existe, proceder con el login normal
                localStorage.setItem("tetrisPlayerName", nameToUse);
                onLogin(nameToUse);
                
            } catch (err) {
                console.error(err);
                setError("Error de conexión. Inténtalo de nuevo.");
                setIsChecking(false);
            }
        }
    };
    
    return (
        <div className="login-container">
            <h1 className="title">React Tetris Multiplayer</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="playerName">Enter your name:</label>
                <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => {
                        setPlayerName(e.target.value);
                        setError(""); // Limpiar error al escribir
                    }}
                    placeholder="Your name..."
                    maxLength={20}
                    autoFocus
                    disabled={isChecking} // Deshabilitar mientras comprueba
                />
                
                {/* Mostrar mensaje de error si existe */}
                {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>{error}</p>}

                <button 
                    type="submit" 
                    className="btn" 
                    disabled={!playerName.trim() || isChecking}
                >
                    {isChecking ? "Checking..." : "Join Game"}
                </button>
            </form>
        </div>
    );
};

export default Login;
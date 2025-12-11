import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Game from "./components/Game";
import "./styles.css";

function App() {
    const [playerName, setPlayerName] = useState(null);
    const navigate = useNavigate(); // <--- Hook para navegar

    const handleLogin = (name) => {
        setPlayerName(name);
        navigate("/game"); // <--- Navegar explícitamente al juego
    };

    const handleLogout = () => {
        setPlayerName(null);
        localStorage.removeItem("tetrisPlayerName"); // Limpiar storage
        navigate("/"); // <--- Volver al login
    };

    // Componente "Protector": Si no hay nombre, te echa al Login
    const ProtectedGame = () => {
        if (!playerName) {
            return <Navigate to="/" replace />;
        }
        return <Game playerName={playerName} onLogout={handleLogout} />;
    };

    return (
        <Routes>
            {/* RUTA 1: LOGIN */}
            <Route 
                path="/" 
                element={<Login onLogin={handleLogin} />} 
            />

            {/* RUTA 2: JUEGO (Protegida) */}
            <Route 
                path="/game" 
                element={<ProtectedGame />} 
            />
            
            {/* RUTA COMODÍN: Cualquier otra cosa va al Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
import { useState, useEffect } from "react";

const Login = ({ onLogin }) => {
    const [playerName, setPlayerName] = useState("");
    
    // Cargar nombre guardado del localStorage
    useEffect(() => {
        const savedName = localStorage.getItem("tetrisPlayerName");
        if (savedName) {
            setPlayerName(savedName);
        }
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            // Guardar nombre en localStorage
            localStorage.setItem("tetrisPlayerName", playerName.trim());
            onLogin(playerName.trim());
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
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your name..."
                    maxLength={20}
                    autoFocus
                />
                <button type="submit" className="btn" disabled={!playerName.trim()}>
                    Join Game
                </button>
            </form>
        </div>
    );
};

export default Login;

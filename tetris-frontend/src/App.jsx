import { useState } from "react";
import Login from "./components/Login";
import Game from "./components/Game";
import "./styles.css";

function App() {
    const [playerName, setPlayerName] = useState(null);
    
    const handleLogin = (name) => {
        setPlayerName(name);
    };
    
    const handleLogout = () => {
        setPlayerName(null);
    };
    
    if (!playerName) {
        return <Login onLogin={handleLogin} />;
    }
    
    return <Game playerName={playerName} onLogout={handleLogout} />;
}

export default App;

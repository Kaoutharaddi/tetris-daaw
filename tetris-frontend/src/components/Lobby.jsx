import { useState, useEffect } from "react";
import { getRanking } from "../persistence/rankingApi";

const Lobby = ({ players, lastGameResults, playerName }) => {
    const [ranking, setRanking] = useState([]);
    
    // Cargar ranking desde la API REST
    useEffect(() => {
        const fetchRanking = async () => {
            const data = await getRanking();
            setRanking(data);
        };
        fetchRanking();
    }, [lastGameResults]); // Recargar cuando cambien los resultados
    
    // Ordenar jugadores por líneas (para mostrar resultados)
    const sortedPlayers = Object.values(players).sort((a, b) => b.lines - a.lines);
    
    return (
        <div className="lobby">
            <h2>Lobby</h2>
            
            {/* Jugadores conectados */}
            <div className="lobby-section">
                <h3>Connected Players ({Object.keys(players).length})</h3>
                <ul className="player-list">
                    {Object.values(players).map((player) => (
                        <li key={player.name} className={player.name === playerName ? "current-player" : ""}>
                            {player.name} {player.name === playerName && "(you)"}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Resultados de la última partida */}
            {lastGameResults && lastGameResults.results && lastGameResults.results.length > 0 && (
                <div className="lobby-section">
                    <h3>Last Game Results</h3>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Level</th>
                                <th>Lines</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lastGameResults.results.map((result, index) => (
                                <tr key={result.name}>
                                    <td>{index + 1}</td>
                                    <td>{result.name}</td>
                                    <td>{result.level}</td>
                                    <td>{result.lines}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Ranking histórico */}
            <div className="lobby-section">
                <h3>Historical Ranking (Top 10)</h3>
                {ranking.length > 0 ? (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Level</th>
                                <th>Lines</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.slice(0, 10).map((entry, index) => (
                                <tr key={entry.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{entry.nombre}</td>
                                    <td>{entry.nivel}</td>
                                    <td>{entry.lineas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No records yet</p>
                )}
            </div>
            
            {/* Instrucciones */}
            <div className="lobby-instructions">
                <p className="start-instruction">Press ENTER to start the game</p>
                <div className="help">
                    <p>← → Move</p>
                    <p>↑ Rotate</p>
                    <p>↓ Soft drop</p>
                    <p>Space Hard drop</p>
                    <p>P Pause</p>
                </div>
            </div>
        </div>
    );
};

export default Lobby;

import { useState, useEffect, useCallback, useRef } from "react";
import TetrisBoard, { useTetrisBoard } from "./TetrisBoard";
import NextPiece from "./NextPiece";
import Lobby from "./Lobby";
import {
    registerPlayer,
    removePlayer,
    attachPlayersListener,
    attachGameStateListener,
    attachAttacksListener,
    attachLastGameResultsListener,
    setGameState,
    updatePlayerState,
    sendAttack,
    clearAttack,
    saveLastGameResults,
    resetGameForNewMatch
} from "../persistence/gameRepository";
import { postScore } from "../persistence/rankingApi";

const Game = ({ playerName, onLogout }) => {
    // Estado de jugadores conectados
    const [players, setPlayers] = useState({});
    
    // Estado global del juego (compartido via Firebase)
    const [gameState, setLocalGameState] = useState({
        started: false,
        paused: false,
        gameOver: false,
        resetTrigger: 0
    });
    
    // Resultados de la última partida
    const [lastGameResults, setLastGameResults] = useState(null);
    
    // Líneas basura pendientes de procesar
    const [pendingGarbage, setPendingGarbage] = useState(0);
    
    // Ataques ya procesados (para evitar duplicados)
    const processedAttacks = useRef(new Set());
    
    // Referencia al componente TetrisBoard
    const tetrisBoardRef = useRef(null);
    
    // Estado local del jugador
    const [localStats, setLocalStats] = useState({ lines: 0, level: 1 });
    
    // Registrar jugador al montar
    useEffect(() => {
        registerPlayer(playerName).catch(console.error);
        
        return () => {
            removePlayer(playerName).catch(console.error);
        };
    }, [playerName]);
    
    // Escuchar lista de jugadores
    useEffect(() => {
        const detach = attachPlayersListener(
            (data) => {
                setPlayers(data);
                // Si soy el único jugador conectado, aseguro que el juego esté en modo Lobby (started: false)
                // Esto limpia estados "sucios" de pruebas anteriores en Firebase.
                if (data && Object.keys(data).length === 1 && data[playerName]) {
                    setGameState({ started: false, paused: false, gameOver: false })
                        .catch(err => console.error("Error resetting game state:", err));
                }
            },
            (err) => console.error("Players listener error:", err)
        );
        return () => detach();
    }, [playerName]);
    
    // Escuchar estado global del juego
    useEffect(() => {
        const detach = attachGameStateListener(
            (data) => {
                setLocalGameState((prev) => ({
                    ...prev,
                    started: data.started || false,
                    paused: data.paused || false,
                    gameOver: data.gameOver || false
                }));
            },
            (err) => console.error("Game state listener error:", err)
        );
        return () => detach();
    }, []);
    
    // Escuchar resultados de última partida
    useEffect(() => {
        const detach = attachLastGameResultsListener(
            (data) => setLastGameResults(data),
            (err) => console.error("Last game results listener error:", err)
        );
        return () => detach();
    }, []);
    
    // Escuchar ataques
    useEffect(() => {
        const detach = attachAttacksListener(
            (attacks) => {
                if (!attacks) return;
                
                Object.entries(attacks).forEach(([attackId, attack]) => {
                    // No procesar ataques propios ni ya procesados
                    if (attack.from === playerName || processedAttacks.current.has(attackId)) {
                        return;
                    }
                    
                    // Marcar como procesado
                    processedAttacks.current.add(attackId);
                    
                    // Añadir líneas basura
                    setPendingGarbage((prev) => prev + attack.lines);
                    
                    // Limpiar el ataque de Firebase
                    clearAttack(attackId).catch(console.error);
                });
            },
            (err) => console.error("Attacks listener error:", err)
        );
        return () => detach();
    }, [playerName]);
    
    // Manejar teclas globales
    useEffect(() => {
        const handleKeyDown = async (e) => {
            // Enter para iniciar partida (solo en lobby)
            if (e.key === "Enter" && !gameState.started) {
                e.preventDefault();
                await resetGameForNewMatch();
                await setGameState({ started: true, paused: false, gameOver: false });
                setLocalGameState((prev) => ({ ...prev, resetTrigger: prev.resetTrigger + 1 }));
                processedAttacks.current.clear();
            }
            
            // P para pausar/reanudar
            if (e.code === "KeyP" && gameState.started && !gameState.gameOver) {
                e.preventDefault();
                await setGameState({ 
                    started: true, 
                    paused: !gameState.paused, 
                    gameOver: false 
                });
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);
    
    // Callback cuando se eliminan líneas
    const handleLinesCleared = useCallback(async (clearedCount, totalLines, newLevel) => {
        setLocalStats({ lines: totalLines, level: newLevel });
        
        // Actualizar estado del jugador en Firebase
        await updatePlayerState(playerName, {
            lines: totalLines,
            level: newLevel
        });
        
        // Enviar ataque a otros jugadores si hay más de 1 jugador
        if (Object.keys(players).length > 1 && clearedCount > 0) {
            await sendAttack(playerName, clearedCount);
        }
    }, [playerName, players]);
    
    // Callback cuando el jugador pierde
    const handleGameOver = useCallback(async (finalLines, finalLevel) => {
        // Marcar jugador como gameOver
        await updatePlayerState(playerName, {
            gameOver: true,
            lines: finalLines,
            level: finalLevel
        });
        
        // Guardar puntuación en el ranking
        await postScore(playerName, finalLevel, finalLines);
        
        // Verificar si todos los jugadores han perdido
        // o si solo queda uno (en caso de más de 1 jugador)
        setTimeout(async () => {
            const currentPlayers = Object.values(players);
            const playersAlive = currentPlayers.filter((p) => !p.gameOver);
            
            if (playersAlive.length === 0 || 
                (currentPlayers.length > 1 && playersAlive.length <= 1)) {
                // Fin de la partida
                await setGameState({ started: false, paused: false, gameOver: true });
                
                // Guardar resultados de la partida
                const results = currentPlayers
                    .map((p) => ({ name: p.name, lines: p.lines || 0, level: p.level || 1 }))
                    .sort((a, b) => b.lines - a.lines);
                
                await saveLastGameResults(results);
            }
        }, 500);
    }, [playerName, players]);
    
    // Callback cuando se procesan las líneas basura
    const handleGarbageProcessed = useCallback(() => {
        setPendingGarbage(0);
    }, []);
    
    // Usar el hook personalizado de TetrisBoard
    const tetrisState = useTetrisBoard({
        gameState,
        playerName,
        onLinesCleared: handleLinesCleared,
        onGameOver: handleGameOver,
        pendingGarbage,
        onGarbageProcessed: handleGarbageProcessed
    });
    
    // Mostrar lobby si el juego no ha empezado
    if (!gameState.started) {
        return (
            <div className="game-container">
                <Lobby 
                    players={players} 
                    lastGameResults={lastGameResults}
                    playerName={playerName}
                />
                <button className="btn logout-btn" onClick={onLogout}>
                    Leave
                </button>
            </div>
        );
    }
    
    return (
        <div className="game-container">
            <div className="layout">
                {/* Tablero principal */}
                <div className="board-container">
                    <h1 className="title">React Tetris</h1>
                    <TetrisBoard renderBoard={tetrisState.renderBoard} />
                </div>
                
                {/* Panel lateral */}
                <div className="panel">
                    {gameState.paused && <div className="banner pause">Paused</div>}
                    {(gameState.gameOver || tetrisState.localGameOver) && (
                        <div className="banner over">Game Over</div>
                    )}
                    
                    <div className="stat">Player: {playerName}</div>
                    <div className="stat">Level: {tetrisState.level}</div>
                    <div className="stat">Lines: {tetrisState.lines}</div>
                    
                    <NextPiece piece={tetrisState.nextPiece} />
                    
                    {/* Lista de jugadores */}
                    <div className="players-panel">
                        <h4>Players</h4>
                        <ul className="player-list-small">
                            {Object.values(players).map((player) => (
                                <li 
                                    key={player.name}
                                    className={`
                                        ${player.name === playerName ? "current" : ""}
                                        ${player.gameOver ? "eliminated" : ""}
                                    `}
                                >
                                    {player.name}: L{player.level || 1} - {player.lines || 0} lines
                                    {player.gameOver && " ✗"}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="help">
                        <p>← → Move</p>
                        <p>↑ Rotate</p>
                        <p>↓ Drop</p>
                        <p>Space Hard drop</p>
                        <p>P Pause</p>
                    </div>
                </div>
            </div>
            
            {/* Instrucciones post-game */}
            {gameState.gameOver && (
                <div className="postgame-instructions">
                    <p>Press ENTER to start a new game</p>
                </div>
            )}
        </div>
    );
};

export default Game;

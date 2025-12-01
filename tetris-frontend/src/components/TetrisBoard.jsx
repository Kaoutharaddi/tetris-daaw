import { useState, useEffect, useCallback, useRef } from "react";
import { ROWS, COLS, BASE_SPEED, SPEED_DECREASE_PER_LEVEL, LINES_PER_LEVEL, SHAPES, COLORS } from "../constants";

// Generar una pieza aleatoria
function randomPiece() {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    return { type, rotation: 0, x: 3, y: 0 };
}

// Rotar una pieza
function rotate(piece, dir = 1) {
    const total = SHAPES[piece.type].length;
    return { ...piece, rotation: (piece.rotation + dir + total) % total };
}

// Obtener la matriz de una pieza
function getMatrix(piece) {
    return SHAPES[piece.type][piece.rotation];
}

// Calcular velocidad según nivel
function calculateSpeed(level) {
    return Math.max(100, BASE_SPEED * Math.pow(1 - SPEED_DECREASE_PER_LEVEL, level - 1));
}

// Generar líneas basura con dos huecos aleatorios
function generateGarbageLines(count) {
    const lines = [];
    for (let i = 0; i < count; i++) {
        const line = Array(COLS).fill("garbage");
        const hole1 = Math.floor(Math.random() * COLS);
        let hole2 = Math.floor(Math.random() * COLS);
        while (hole2 === hole1) {
            hole2 = Math.floor(Math.random() * COLS);
        }
        line[hole1] = null;
        line[hole2] = null;
        lines.push(line);
    }
    return lines;
}

// Hook personalizado para la lógica del tablero
export function useTetrisBoard({
    gameState,
    playerName,
    onLinesCleared,
    onGameOver,
    pendingGarbage,
    onGarbageProcessed
}) {
    const [board, setBoard] = useState(
        Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    );
    const [piece, setPiece] = useState(randomPiece());
    const [nextPiece, setNextPiece] = useState(randomPiece());
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [localGameOver, setLocalGameOver] = useState(false);
    
    const gameLoopRef = useRef(null);
    const boardRef = useRef(board);
    const pieceRef = useRef(piece);
    
    useEffect(() => {
        boardRef.current = board;
    }, [board]);
    
    useEffect(() => {
        pieceRef.current = piece;
    }, [piece]);
    
    // Detectar colisiones
    const collide = useCallback((b, p, offX = 0, offY = 0) => {
        const m = getMatrix(p);
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (!m[y][x]) continue;
                const nx = p.x + x + offX;
                const ny = p.y + y + offY;
                if (ny < 0) continue;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (b[ny][nx]) return true;
            }
        }
        return false;
    }, []);
    
    // Fusionar pieza con el tablero
    const merge = useCallback((b, p) => {
        const m = getMatrix(p);
        const newBoard = b.map((r) => r.slice());
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (m[y][x]) {
                    const ny = p.y + y;
                    const nx = p.x + x;
                    if (ny >= 0) newBoard[ny][nx] = p.type;
                }
            }
        }
        return newBoard;
    }, []);
    
    // Limpiar líneas completas
    const clearLines = useCallback((b) => {
        const rowsKept = b.filter((r) => r.some((c) => !c));
        const cleared = ROWS - rowsKept.length;
        const newRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
        return { newBoard: [...newRows, ...rowsKept], cleared };
    }, []);
    
    // Reset del juego
    const resetGame = useCallback(() => {
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
        setPiece(randomPiece());
        setNextPiece(randomPiece());
        setLines(0);
        setLevel(1);
        setLocalGameOver(false);
    }, []);
    
    // Spawn de nueva pieza
    const spawn = useCallback(() => {
        const newPiece = nextPiece;
        setNextPiece(randomPiece());
        
        if (collide(boardRef.current, newPiece, 0, 0)) {
            setLocalGameOver(true);
            onGameOver(lines, level);
        } else {
            setPiece(newPiece);
        }
    }, [nextPiece, collide, onGameOver, lines, level]);
    
    // Paso hacia abajo
    const stepDown = useCallback(() => {
        if (localGameOver || gameState.paused || !gameState.started || gameState.gameOver) return;
        
        const currentBoard = boardRef.current;
        const currentPiece = pieceRef.current;
        
        if (!collide(currentBoard, currentPiece, 0, 1)) {
            setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
        } else {
            const merged = merge(currentBoard, currentPiece);
            const { newBoard, cleared } = clearLines(merged);
            setBoard(newBoard);
            
            if (cleared > 0) {
                const newLines = lines + cleared;
                setLines(newLines);
                
                const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
                if (newLevel !== level) {
                    setLevel(newLevel);
                }
                
                onLinesCleared(cleared, newLines, newLevel);
            }
            
            spawn();
        }
    }, [localGameOver, gameState, collide, merge, clearLines, spawn, lines, level, onLinesCleared]);
    
    // Game loop
    useEffect(() => {
        if (localGameOver || gameState.paused || !gameState.started || gameState.gameOver) {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
            return;
        }
        
        const speed = calculateSpeed(level);
        gameLoopRef.current = setInterval(stepDown, speed);
        
        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [localGameOver, gameState.paused, gameState.started, gameState.gameOver, level, stepDown]);
    
    // Procesar líneas basura recibidas
    useEffect(() => {
        if (pendingGarbage > 0 && !localGameOver && gameState.started && !gameState.gameOver) {
            const garbageLines = generateGarbageLines(pendingGarbage);
            
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard.slice(pendingGarbage), ...garbageLines];
                return newBoard;
            });
            
            onGarbageProcessed();
        }
    }, [pendingGarbage, localGameOver, gameState.started, gameState.gameOver, onGarbageProcessed]);
    
    // Manejar teclas
    useEffect(() => {
        const handleKeyDown = (e) => {
            const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
            if (keys.includes(e.key) || keys.includes(e.code)) e.preventDefault();
            
            if (localGameOver || !gameState.started || gameState.paused || gameState.gameOver) return;
            
            const currentBoard = boardRef.current;
            const currentPiece = pieceRef.current;
            
            if (e.key === "ArrowLeft" && !collide(currentBoard, currentPiece, -1, 0)) {
                setPiece((p) => ({ ...p, x: p.x - 1 }));
            }
            
            if (e.key === "ArrowRight" && !collide(currentBoard, currentPiece, 1, 0)) {
                setPiece((p) => ({ ...p, x: p.x + 1 }));
            }
            
            if (e.key === "ArrowDown") {
                stepDown();
            }
            
            if (e.key === "ArrowUp") {
                const rotated = rotate(currentPiece);
                if (!collide(currentBoard, rotated, 0, 0)) {
                    setPiece(rotated);
                }
            }
            
            if (e.code === "Space") {
                let dy = 0;
                while (!collide(currentBoard, currentPiece, 0, dy + 1)) dy++;
                
                const landed = { ...currentPiece, y: currentPiece.y + dy };
                const merged = merge(currentBoard, landed);
                const { newBoard, cleared } = clearLines(merged);
                
                setBoard(newBoard);
                
                if (cleared > 0) {
                    const newLines = lines + cleared;
                    setLines(newLines);
                    
                    const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
                    if (newLevel !== level) {
                        setLevel(newLevel);
                    }
                    
                    onLinesCleared(cleared, newLines, newLevel);
                }
                
                spawn();
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [localGameOver, gameState, collide, merge, clearLines, spawn, stepDown, lines, level, onLinesCleared]);
    
    // Reset al comenzar nueva partida
    useEffect(() => {
        if (gameState.resetTrigger > 0) {
            resetGame();
        }
    }, [gameState.resetTrigger, resetGame]);
    
    // Renderizar tablero con pieza actual
    const getRenderBoard = () => {
        const temp = board.map((row) => [...row]);
        const m = getMatrix(piece);
        
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (!m[y][x]) continue;
                const ny = piece.y + y;
                const nx = piece.x + x;
                if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
                    temp[ny][nx] = piece.type;
                }
            }
        }
        return temp;
    };
    
    return {
        renderBoard: getRenderBoard(),
        nextPiece: nextPiece,
        lines: lines,
        level: level,
        localGameOver: localGameOver,
        resetGame: resetGame
    };
}

// Componente de visualización del tablero
const TetrisBoard = ({ renderBoard }) => {
    return (
        <div className="board">
            {renderBoard.map((row, r) =>
                row.map((cell, c) => (
                    <div
                        key={`${r}-${c}`}
                        className="cell"
                        style={{
                            backgroundColor: cell ? COLORS[cell] : "transparent",
                        }}
                    />
                ))
            )}
        </div>
    );
};

export default TetrisBoard;

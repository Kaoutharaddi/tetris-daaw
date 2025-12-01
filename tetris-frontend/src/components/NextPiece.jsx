import { SHAPES, COLORS } from "../constants";

const NextPiece = ({ piece }) => {
    if (!piece) return null;
    
    const matrix = SHAPES[piece.type][0]; // Primera rotación
    const color = COLORS[piece.type];
    
    // Crear grid 4x4 para mostrar la pieza
    const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
    
    // Centrar la pieza en el grid
    const offsetY = Math.floor((4 - matrix.length) / 2);
    const offsetX = Math.floor((4 - matrix[0].length) / 2);
    
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x]) {
                grid[y + offsetY][x + offsetX] = piece.type;
            }
        }
    }
    
    return (
        <div className="next">
            <h4>Next</h4>
            <div className="next-grid">
                {grid.map((row, r) =>
                    row.map((cell, c) => (
                        <div
                            key={`next-${r}-${c}`}
                            className="next-cell"
                            style={{
                                backgroundColor: cell ? COLORS[cell] : "transparent",
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NextPiece;

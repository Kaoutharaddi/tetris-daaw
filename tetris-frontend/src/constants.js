export const ROWS = 20;
export const COLS = 10;
export const BASE_SPEED = 500; // milisegundos por tick inicial
export const SPEED_DECREASE_PER_LEVEL = 0.10; // 10% más rápido por nivel
export const LINES_PER_LEVEL = 10; // líneas necesarias para subir de nivel

export const SHAPES = {
    I: [
        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]],
    ],
    O: [
        [
            [1, 1],
            [1, 1],
        ],
    ],
    T: [
        [
            [0, 1, 0],
            [1, 1, 1],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 0],
        ],
        [
            [1, 1, 1],
            [0, 1, 0],
        ],
        [
            [0, 1],
            [1, 1],
            [0, 1],
        ],
    ],
    L: [
        [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
        [
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 1],
            [0, 1],
            [0, 1],
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
        ],
    ],
    J: [
        [
            [0, 1],
            [0, 1],
            [1, 1],
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
        ],
        [
            [1, 1],
            [1, 0],
            [1, 0],
        ],
        [
            [1, 1, 1],
            [0, 0, 1],
        ],
    ],
    S: [
        [
            [0, 1, 1],
            [1, 1, 0],
        ],
        [
            [1, 0],
            [1, 1],
            [0, 1],
        ],
    ],
    Z: [
        [
            [1, 1, 0],
            [0, 1, 1],
        ],
        [
            [0, 1],
            [1, 1],
            [1, 0],
        ],
    ],
};

export const COLORS = {
    I: "cyan",
    O: "yellow",
    T: "purple",
    L: "orange",
    J: "blue",
    S: "green",
    Z: "red",
    garbage: "#555", // Color para líneas basura
};

import { useCallback, useEffect, useRef } from 'react';

import './Board.scss';

const Board = props => {
    const {
        size,
        state
    } = props;
    const board = useRef();

    const initializeBoard = useCallback(() => {
        const { clientWidth, clientHeight } = board.current;
        const ctx = board.current.getContext('2d');

        board.current.height = clientHeight;
        board.current.width = clientWidth;

        // Constant definitions related to board
        const gridPadding = Math.floor(clientWidth / 22) + .5;
        const gridWidth = 1;
        const gridColor = '#000';
        const referencePointColor = '#000';
        const innerSize = clientHeight - (2 * gridPadding);
        const gridOffset = innerSize / (size - 1);

        // Fill background
        ctx.rect(0, 0, clientWidth, clientHeight);
        ctx.fillStyle = '#DCAD65';
        ctx.fill();

        // Draw grid lines
        ctx.beginPath();
        // Draw horizontal grids
        for(let i = 0; i < size; i++) {
            const startX = gridPadding;
            const startY = gridPadding + Math.floor(i * gridOffset);
            const toX    = clientWidth - gridPadding;

            ctx.moveTo(startX, startY);
            ctx.lineTo(toX, startY);
        }
        // Draw vertical grids
        for(let i = 0; i < size; i++) {
            const startX = gridPadding + Math.floor(i * gridOffset);
            const startY = gridPadding;
            const toY = clientHeight - gridPadding;

            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, toY);
        }
        ctx.lineWidth = gridWidth;
        ctx.strokeStyle = gridColor;
        ctx.stroke();

        // Draw reference points
        const points = {
            9: [
                [2, 2], [2, 6],
                [4, 4],
                [6, 2], [6, 6]
            ],
            13: [
                [3, 3], [3, 9],
                [6, 6],
                [9, 3], [9, 9]
            ],
            19: [
                [3, 3], [3, 9], [3, 15],
                [9, 3], [9, 9], [9, 15],
                [15, 3], [15, 9], [15, 15]
            ]
        };
        ctx.beginPath();
        points[size].forEach(([row, col]) => {
            const centerX = gridPadding + Math.floor(col * gridOffset);
            const centerY = gridPadding + Math.floor(row * gridOffset);
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, clientWidth / 90, 0, 2 * Math.PI);
        });
        ctx.fillStyle = referencePointColor;
        ctx.fill();

        // Draw stones
        ctx.beginPath();
        state.forEach((row, rowIndex) => {
            row.forEach((stone, columnIndex) => {
                const centerX = gridPadding + Math.floor(columnIndex * gridOffset);
                const centerY = gridPadding + Math.floor(rowIndex * gridOffset);
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, clientWidth / (size * 2.5), 0, 2 * Math.PI);
                ctx.fillStyle = stone ? '#fff' : '#000';
                ctx.fill();
            });
        });
    }, [size, state]);
    if(size === 13) {
        console.log(state);
    }

    useEffect(() => {
        initializeBoard(board.current);
    }, [initializeBoard]);

    return (
        <canvas className="board" ref={board}></canvas>
    );
};

export default Board;
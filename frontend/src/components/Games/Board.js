import { useCallback, useEffect, useRef } from 'react';

import './Board.scss';

const Board = props => {
    const {
        size,
        state,
        dynamicHeight,
        className: customClassName
    } = props;
    const board = useRef();

    let className = 'board';

    if(dynamicHeight) {
        className = `${className} board--dynamic-height`;
    }

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    const resizeBoard = useCallback(() => {
        const { clientWidth, clientHeight } = board.current;

        board.current.height = clientHeight;
        board.current.width = clientWidth;
    }, []);

    const drawBoard = useCallback(() => {
        const { clientWidth, clientHeight } = board.current;
        const ctx = board.current.getContext('2d');

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
        state.forEach((row, rowIndex) => {
            row.forEach((stone, columnIndex) => {
                if(stone !== null) {
                    ctx.beginPath();
                    const centerX = gridPadding + Math.floor(columnIndex * gridOffset);
                    const centerY = gridPadding + Math.floor(rowIndex * gridOffset);
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, clientWidth / (size * 2.75), 0, 2 * Math.PI);
                    ctx.fillStyle = stone ? '#000' : '#fff';
                    ctx.fill();
                }
            });
        });
    }, [size, state]);
    
    const clickHandler = ({ clientX, clientY }) => {
        const { clientWidth, clientHeight } = board.current;
        const { x: clientRectX, y: clientRectY } = board.current.getClientRects()[0];

        // Constant definitions related to board
        const gridPadding = Math.floor(clientWidth / 22) + .5;
        const innerSize = clientHeight - (2 * gridPadding);
        const gridOffset = innerSize / (size - 1);

        // Clicked point's coordinates with respect to canvas' origin (top left corner)
        const coordinates = {
            x: clientX - clientRectX,
            y: clientY - clientRectY
        };
        // Clicked point's index numbers (i for row, j for column index)
        const row = Math.round((coordinates.y - gridPadding) / gridOffset);
        const column = Math.round((coordinates.x - gridPadding) / gridOffset);

        if(state[row][column] === null) {
            // state[row][column] = Math.random() < .5;
            drawBoard();
        }
        console.log(coordinates, row, column);
    };

    useEffect(() => {
        resizeBoard();
        drawBoard();

        const resizeHandler = () => {
            resizeBoard();
            drawBoard();
        };

        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [resizeBoard, drawBoard]);

    return (
        <canvas className={className} ref={board} onClick={clickHandler}></canvas>
    );
};

export default Board;
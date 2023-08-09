import { useCallback, useEffect, useRef } from 'react';

import './Board.scss';
import { socket } from '../../websocket';

const drawStone = (centerX, centerY, radius, color, ctx, isDead = false) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    if(isDead) {
        ctx.fillStyle = color === '#fff' ? 'rgba(255, 255, 255, .6)' : 'rgba(0, 0, 0, .6)';
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();
};

const Board = props => {
    const {
        'game-id': gameId,
        status,
        size,
        state,
        groups,
        'empty-groups': emptyGroups,
        dynamicHeight,
        className: customClassName,
        'is-player': isPlayer,
        'player-color': playerColor
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
        if(status === 'finishing') {
            groups.forEach(group => {
                const isGroupRemoved = group.removedAtMove !== -1;

                if(isGroupRemoved) {
                    return;
                }

                const activeStones = group.stones.filter(
                    stone => stone.removedAtMove === -1
                );

                activeStones.forEach(stone => {
                    // TODO: If group isDead add a center dot on stones
                    drawStone(
                        gridPadding + Math.floor(stone.column * gridOffset),
                        gridPadding + Math.floor(stone.row * gridOffset),
                        clientWidth / (size * 2.75),
                        group.player === 'black' ? '#000' : '#fff',
                        ctx,
                        group.isDead
                    );
                });
            })
        } else {
            state.forEach((row, rowIndex) => {
                row.forEach((stone, columnIndex) => {
                    if(stone !== null) {
                        drawStone(
                            gridPadding + Math.floor(columnIndex * gridOffset),
                            gridPadding + Math.floor(rowIndex * gridOffset),
                            clientWidth / (size * 2.75),
                            stone ? '#000' : '#fff',
                            ctx
                        );
                    }
                });
            });
        }

        // If game is at "finishing" status, then draw the lines respresenting
        // empty groups captured by players
        if(status === 'finishing') {
            emptyGroups.forEach(emptyGroup => {
                const { capturedBy, positions } = emptyGroup;
                const isNotCapturedByAPlayer = capturedBy === null;

                if(isNotCapturedByAPlayer) {
                    return;
                }

                positions.forEach(position => {
                    const { row, column } = position;
                    ctx.beginPath();
                    const centerX = gridPadding + Math.floor(column * gridOffset);
                    const centerY = gridPadding + Math.floor(row * gridOffset);
                    const sideLength = gridOffset / 4;
                    ctx.moveTo(centerX, centerY);
                    ctx.fillStyle = capturedBy === 'black' ? '#000' : '#fff';
                    ctx.fillRect(centerX - (sideLength / 2), centerY - (sideLength / 2), sideLength, sideLength);
                    ctx.fill();
                });
            });
        }
    }, [status, size, state, groups, emptyGroups]);
    
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
            if((status === 'waiting' || status === 'started') && isPlayer) {
                socket.emit('addStone', gameId, row, column);
            }
        }
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
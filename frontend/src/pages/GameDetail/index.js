import { useCallback, useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useLoaderData, useLocation } from 'react-router-dom';
import { formatSeconds, firstLetterToUppercase, BASE_URL } from '../../utils/helpers';

import { store } from '../../store/store';
import { toastActions } from '../../store/toastSlice';
import { gameActions } from '../../store/gameSlice';
import { socket } from '../../websocket';

import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';
import Board from '../../components/Games/Board';
import Button from '../../components/UI/Button';
import PlayerCard from '../../components/Games/PlayerCard';
import Modal from '../../components/UI/Modal';
import Chat from '../../components/Games/Chat';

import './style.scss';
import { createPortal } from 'react-dom';

let timeout;
let undoRequestTimeout;

const UndoRequestModal = props => {
    const {
        'time-remaining': timeRemaining,
        'game-id': gameId
    } = props;

    const rejectHandler = () => {
        socket.emit('rejectUndoRequest', gameId);
    };

    const acceptHandler = () => {
        socket.emit('acceptUndoRequest', gameId);
    };

    return (
        <Modal
            title="Undo request"
            buttons={[
                {
                    text: 'Reject',
                    color: 'danger',
                    onClick: rejectHandler
                },
                {
                    text: 'Accept',
                    color: 'success',
                    onClick: acceptHandler
                }
            ]}
            onDismiss={rejectHandler}
        >
            <p className="mb-2">Your opponent requests an undo. Do you want to accept?</p>
            <p>Time remaining to accept: {formatSeconds(timeRemaining)}</p>
        </Modal>
    );
};

const getStatusMessage = (status, timer, isBlackPlayer, isWhitePlayer, isPlayer, playerColor, lastMove, whosTurn) => {
    if(status === 'waiting') {
        return `Waiting for black player to play (${formatSeconds(timer)})`;
    }

    if(status === 'cancelled') {
        return `The game has been cancelled!`;
    }

    if(status.includes('cancelled_by_')) {
        return `The game has been cancelled by ${status.replace('cancelled_by_', '')} player!`;
    }

    if(status === 'black_resigned' && isPlayer) {
        if(isBlackPlayer) {
            return `You have resigned from the game!`;
        } else {
            return `Your opponent have resigned from the game!`;
        }
    }

    if(status === 'white_resigned' && isPlayer) {
        if(isWhitePlayer) {
            return `You have resigned from the game!`;
        } else {
            return `Your opponent have resigned from the game!`;
        }
    }

    if(status.includes('_resigned') && !isPlayer) {
        return `${firstLetterToUppercase(status.replace('_resigned', ''))} player resigned from the game!`;
    }

    if(status === 'started' && isPlayer && !lastMove?.pass) {
        if((isBlackPlayer && whosTurn === 'black') || (isWhitePlayer && whosTurn === 'white')) {
            return `Your turn to play`;
        } else {
            return `Your opponent's turn to play`;
        }
    }

    if(status === 'started' && !isPlayer && !lastMove?.pass) {
        if(whosTurn === 'black') {
            return `Black player's turn to play`;
        } else {
            return `White player's turn to play`;
        }
    }
    
    if(status === 'started' && isPlayer && lastMove?.pass) {
        if(lastMove?.player === playerColor) {
            return `You've passed your turn`;
        } else {
            return `Your opponent has passed their turn`;
        }
    }

    if(status === 'started' && !isPlayer && lastMove?.pass) {
        return `${firstLetterToUppercase(lastMove?.player)} player has passed their turn`;
    }

    if(status === 'finishing') {
        if(isPlayer) {
            return `Select areas and stones you've captured`;
        } else {
            return  `Players are finishing the game`;
        }
    }

    if(status === 'black_won' && isPlayer) {
        if(isBlackPlayer) {
            return `You have won!`;
        } else {
            return `You have lost!`;
        }
    }

    if(status === 'white_won' && isPlayer) {
        if(isWhitePlayer) {
            return `You have won!`;
        } else {
            return `You have lost!`;
        }
    }

    if(status.includes('_won') && !isPlayer) {
        return `${firstLetterToUppercase(status.replace('_won', ''))} player won the game!`;
    }
}

const GameDetailPage = () => {
    const resData = useLoaderData();
    const dispatch = useDispatch();
    const location = useLocation();

    const username = useSelector(state => state.user.username);
    const game = useSelector(state => state.game._id ? state.game : null) || resData.game;

    const isBlackPlayer = username && game.black.user.username === username;
    const isWhitePlayer = username && game.white.user.username === username;
    const isPlayer = isBlackPlayer || isWhitePlayer;
    const [timer, setTimer] = useState(null);
    const [undoRequestTimer, setUndoRequestTimer] = useState(null);

    let playerColor;
    if(isBlackPlayer) {
        playerColor = 'black';
    } else if(isWhitePlayer) {
        playerColor = 'white';
    } else {
        playerColor = null;
    }

    let whosTurn = 'black';
    const lastMove = game.moves[game.moves.length - 1];
    if(game.status === 'started' && lastMove?.player === 'black') {
        whosTurn = 'white';
    }

    const shouldShowUndoRequestModal =
        game.status === 'started'
        && isPlayer
        && game.undo.requestedBy
        && game.undo.requestedAt
        && game.undo.requestEndsAt
        && (
            (isBlackPlayer && game.undo.requestedBy === 'white')
            || (isWhitePlayer && game.undo.requestedBy === 'black')
        );

    const cancelGameHandler = useCallback(() => {
        if(isPlayer && game.status === 'waiting') {
            socket.emit('cancelGame', game._id);
        }
    }, [isPlayer, game.status, game._id]);

    const resignHandler = useCallback(() => {
        if(isPlayer && game.status === 'started') {
            socket.emit('resignFromGame', game._id);
        }
    }, [isPlayer, game.status, game._id]);

    const requestUndoHandler = useCallback(() => {
        const requestedBy = lastMove?.player;

        if(!requestedBy) {
            return;
        }

        const isPlayerHaveUndoRights = game[requestedBy].undoRights > 0;

        if(isPlayer && game.status === 'started' && isPlayerHaveUndoRights) {
            socket.emit('requestUndo', game._id);
            dispatch(toastActions.add({
                message: 'Undo requested.',
                status: 'info'
            }));
        }
    }, [dispatch, game, isPlayer, lastMove?.player]);

    const passHandler = useCallback(() => {
        if(isPlayer && whosTurn === playerColor && game.status === 'started') {
            socket.emit('pass', game._id);
        }
    }, [isPlayer, whosTurn, playerColor, game.status, game._id]);

    const cancelFinishingHandler = useCallback(() => {
        if(isPlayer && game.status === 'finishing') {
            socket.emit('cancelFinishing', game._id);
        }
    }, [isPlayer, game.status, game._id]);

    const confirmFinishingHandler = useCallback(() => {
        if(isPlayer && game.status === 'finishing') {
            socket.emit('confirmFinishing', game._id);
        }
    }, [isPlayer, game.status, game._id]);

    // Side effect to initialize timer's value depending on game status
    useEffect(() => {
        if(game.status === 'waiting') {
            const waitingEndsAt = new Date(game.waitingEndsAt);
            const waitingTimeoutInSeconds = ((waitingEndsAt - Date.now()) / 1000).toFixed(2);

            setTimer(waitingTimeoutInSeconds);
        }
        if(game.status === 'started') {
            const currentDate = new Date();
            const lastMoveAt = new Date(lastMove ? lastMove.createdAt : game.startedAt);
            const timeElapsedBetweenInSeconds = (currentDate - lastMoveAt) / 1000;

            const timeRemaningOfPlayer = (game[whosTurn].timeRemaining - timeElapsedBetweenInSeconds).toFixed(2);

            setTimer(timeRemaningOfPlayer);

            if(game.undo.requestedBy && game.undo.requestedAt && game.undo.requestEndsAt) {
                const requestEndsAt = new Date(game.undo.requestEndsAt);
                const undoRequestTimeRemaining = ((requestEndsAt - currentDate) / 1000).toFixed(2);

                setUndoRequestTimer(undoRequestTimeRemaining);
            }
        }
    }, [game, lastMove, whosTurn]);

    // Side effect to run timer down, if timer value is greater than 0
    useEffect(() => {
        if(timer >= 0) {
            // TODO: Use worker timers instead to prevent suspension of intervals
            // https://www.npmjs.com/package/worker-timers
            timeout = setTimeout(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        if(undoRequestTimer >= 0) {
            undoRequestTimeout = setTimeout(() => {
                setUndoRequestTimer(prevUndoRequestTimer => prevUndoRequestTimer - 1);
            }, 1000);
        }

        return () => {
            clearTimeout(timeout);
            clearTimeout(undoRequestTimeout);
        };
    }, [timer, undoRequestTimer]);

    useEffect(() => {
        // When game data is loaded by loader, update gameSlice state
        dispatch(gameActions.updateGame(resData.game));

        socket.emit('joinGameRoom', resData.game._id);
        
        return () => {
            // Reset gameSlice state when user leaves this page/router
            // using clean-up function
            dispatch(gameActions.reset());

            socket.emit('leaveGameRoom', resData.game._id);
        };
    }, [dispatch, location, resData.game]);

    useEffect(() => {
        if(shouldShowUndoRequestModal) {
            document.body.classList.add('modal-open');
        }
    }, [shouldShowUndoRequestModal]);

    return (
        <Container fluid fillVertically>
            <Row columns={2} className="h-100">
                <Column size={7} style={{ height: isPlayer && !game.status.includes('_won') ? 'calc(100% - 7.3rem)' : 'calc(100% - 3.25rem)' }}>
                    <h2 className="board-heading">
                        {getStatusMessage(game.status, timer, isBlackPlayer, isWhitePlayer, isPlayer, playerColor, lastMove, whosTurn)}
                    </h2>
                    <Board
                        game-id={game._id}
                        status={game.status}
                        size={game.size}
                        state={game.board}
                        groups={game.groups}
                        empty-groups={game.emptyGroups}
                        is-player={isPlayer}
                        player-color={playerColor}
                        className="mb-4"
                        dynamicHeight
                    />
                    {isPlayer && (
                        <div className="board-options">
                            {game.status === 'waiting' && (
                                <Button onClick={cancelGameHandler}>
                                    Cancel game
                                </Button>
                            )}
                            {game.status === 'started' && (
                                <Fragment>
                                    <Button onClick={resignHandler}>
                                        Resign
                                    </Button>
                                    <Button
                                        onClick={passHandler}
                                        disabled={whosTurn !== playerColor}
                                    >
                                        Pass
                                    </Button>
                                    <Button
                                        onClick={requestUndoHandler}
                                        disabled={
                                            whosTurn === playerColor
                                            || game[playerColor].undoRights === 0
                                            || (game.undo.requestedBy && game.undo.requestedAt && game.undo.requestEndsAt)
                                        }
                                    >
                                        Undo ({game[playerColor].undoRights})
                                    </Button>
                                </Fragment>
                            )}
                            {game.status === 'finishing' && (
                                <Fragment>
                                    <Button onClick={cancelFinishingHandler}>
                                        Cancel
                                    </Button>
                                    {/* TODO: Disabled button color attribute depended background-color dynamically */}
                                    <Button
                                        color="success"
                                        onClick={confirmFinishingHandler}
                                        disabled={game[playerColor].confirmed}
                                    >
                                        Confirm
                                    </Button>
                                </Fragment>
                            )}
                        </div>
                    )}
                </Column>
                <Column size={5}>
                    <div className="d-flex flex-column h-100">
                        <Row>
                            <Column>
                                <PlayerCard
                                    color="black"
                                    username={game.black.user.username}
                                    elo={game.black.user.elo}
                                    avatar={game.black.user.avatar}
                                    time-remaining={game.status === 'started' && whosTurn === 'black' ? timer : Math.floor(game.black.timeRemaining)}
                                    score={game.black.score}
                                    is-online={isBlackPlayer || game.black.user.isOnline}
                                    active={whosTurn === 'black'}
                                />
                            </Column>
                            <Column>
                                <PlayerCard
                                    color="white"
                                    username={game.white.user.username}
                                    elo={game.white.user.elo}
                                    avatar={game.white.user.avatar}
                                    time-remaining={game.status === 'started' && whosTurn === 'white' ? timer : Math.floor(game.white.timeRemaining)}
                                    score={game.white.score}
                                    is-online={isWhitePlayer || game.white.user.isOnline}
                                    active={whosTurn === 'white'}
                                />
                            </Column>
                        </Row>
                        <Chat />
                    </div>
                </Column>
            </Row>
            {shouldShowUndoRequestModal && createPortal(
                <UndoRequestModal game-id={game._id} time-remaining={undoRequestTimer} />,
                document.getElementById('modal-container')
            )}
        </Container>
    );
};

export const loader = async ({ params }) => {
    const response = await fetch(BASE_URL + '/api/games/' + params.gameId);

    const resData = await response.json();

    if(!response.ok && !response.game) {
        store.dispatch(toastActions.add({
            message: 'Game could not found!',
            status: 'danger',
            delay: false
        }));
    
        return redirect('/');
    }

    return resData;
};

export default GameDetailPage;
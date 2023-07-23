import { useCallback, useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useLoaderData, useLocation } from 'react-router-dom';
import { formatSeconds, firstLetterToUppercase } from '../utils/helpers';

import { store } from '../store/store';
import { toastActions } from '../store/toastSlice';
import { gameActions } from '../store/gameSlice';
import { socket } from '../websocket';

import Row from '../layout/Grid/Row';
import Container from '../layout/Grid/Container';
import Column from '../layout/Grid/Column';
import Board from '../components/Games/Board';
import Button from '../components/UI/Button';
import PlayerCard from '../components/Games/PlayerCard';
import Modal from '../components/UI/Modal';
import Chat from '../components/Games/Chat';

import './GameDetail.scss';
import { createPortal } from 'react-dom';

let timeout;
let undoRequestTimeout;

const UndoRequestModal = props => {
    const {
        'time-remaining': timeRemaining,
        'game-id': gameId
    } = props;

    // TODO: Implement handlers and implmenet server side interval process to reject automatically after
    // requestEndsAt timeout
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

    const shouldShowUndoRequestModal = game.status === 'started' && isPlayer && game.undo.requestedBy && game.undo.requestedAt && game.undo.requestEndsAt && ((isBlackPlayer && game.undo.requestedBy === 'white') || (isWhitePlayer && game.undo.requestedBy === 'black'));

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
                <Column size={7} style={{ height: isPlayer ? 'calc(100% - 7.3rem)' : 'calc(100% - 3.25rem)' }}>
                    <h2 className="board-heading">
                        {game.status === 'waiting' && `Waiting for black player to play (${formatSeconds(timer)})`}
                        {game.status === 'cancelled' && 'The game has been cancelled!'}
                        {(game.status === 'cancelled_by_black' || game.status === 'cancelled_by_white') && `The game has been cancelled by ${game.status.replace('cancelled_by_', '')} player!`}
                        {(game.status === 'black_resigned' || game.status === 'white_resigned') && !isPlayer && `${firstLetterToUppercase(game.status.replace('_resigned', ''))} player resigned from the game!`}
                        {((game.status === 'black_resigned' && isBlackPlayer) || (game.status === 'white_resigned' && isWhitePlayer)) && `You have resigned from the game!`}
                        {((game.status === 'black_resigned' && isWhitePlayer) || (game.status === 'white_resigned' && isBlackPlayer)) && `Your opponent have resigned from the game!`}
                        {game.status === 'started' && isPlayer && ((isBlackPlayer && whosTurn === 'black') || (isWhitePlayer && whosTurn === 'white')) && `Your turn to play`}
                        {game.status === 'started' && isPlayer && ((isBlackPlayer && whosTurn === 'white') || (isWhitePlayer && whosTurn === 'black')) && `Your opponent's turn to play`}
                        {game.status === 'started' && !isPlayer && whosTurn === 'black' && `Black player's turn to play`}
                        {game.status === 'started' && !isPlayer && whosTurn === 'white' && `White player's turn to play`}
                        {((game.status === 'black_won' && isPlayer && isBlackPlayer) || (game.status === 'white_won' && isPlayer && isWhitePlayer)) && 'You have won!'}
                        {((game.status === 'black_won' && isPlayer && !isBlackPlayer) || (game.status === 'white_won' && isPlayer && !isWhitePlayer)) && 'You have lost!'}
                        {game.status === 'black_won' && !isPlayer && 'Black player won the game!'}
                        {game.status === 'white_won' && !isPlayer && 'White player won the game!'}
                    </h2>
                    <Board
                        game-id={game._id}
                        size={game.size}
                        state={game.board}
                        status={game.status}
                        is-player={isPlayer}
                        player-color={playerColor}
                        className="mb-4"
                        dynamicHeight
                    />
                    {isPlayer && (
                        <div className="board-options">
                            {game.status === 'started' && (
                                <Fragment>
                                    <Button onClick={resignHandler}>
                                        Resign
                                    </Button>
                                    <Button>
                                        Pass
                                    </Button>
                                    <Button
                                        onClick={requestUndoHandler}
                                        disabled={
                                            (whosTurn === 'black' && isBlackPlayer)
                                            || (whosTurn === 'white' && isWhitePlayer)
                                            || game[playerColor].undoRights === 0
                                            || (game.undo.requestedBy && game.undo.requestedAt && game.undo.requestEndsAt)
                                        }
                                    >
                                        Undo ({game[playerColor].undoRights})
                                    </Button>
                                </Fragment>
                            )}
                            {game.status === 'waiting' && (
                                <Button onClick={cancelGameHandler}>
                                    Cancel game
                                </Button>
                            )}
                            {(game.status.includes('cancelled') || game.status === 'finished') && (
                                <Button>
                                    Rematch
                                </Button>
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
    const response = await fetch('http://localhost:3000/api/games/' + params.gameId);

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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toastActions } from '../store/toastSlice';
import { queueActions } from '../store/queueSlice';
import { gameActions } from '../store/gameSlice';

import { setSocketId } from '../utils/websocket';
import { socket } from '.';
import { userActions } from '../store/userSlice';

const WebSocketProvider = props => {
    const { navigate } = props;
    const dispatch = useDispatch();
    const viewingGameId = useSelector(state => state.game._id);
    const blackPlayerUsername = useSelector(state => state.game.black?.user?.username);
    const whitePlayerUsername = useSelector(state => state.game.white?.user?.username);
    const username = useSelector(state => state.user.username);
    const isBlackPlayer = username && username === blackPlayerUsername;
    const isWhitePlayer = username && username === whitePlayerUsername;
    const isPlayer = username && (isBlackPlayer || isWhitePlayer);
    const activeGameOfUser = useSelector(state => state.user.activeGame);

	useEffect(() => {
        const onConnect = () => {
            setSocketId(socket.id);
			dispatch(toastActions.add({
                message: 'Connected to websocket server!',
                status: 'info'
            }));
            console.log('Connected with id: ' + socket.id);
		};

        const onDisconnect = (reason, details) => {
            dispatch(toastActions.add({
                message: 'Disconnected from websocket server due to reason ' + reason,
                status: 'danger'
            }));
        };

        const onReconnectAttempt = attemptNumber => {
            if(attemptNumber === 1) {
                dispatch(toastActions.add({
                    message: 'Reconnecting to websocket server...',
                    status: 'info'
                }));
            }
        };

        const onPlayerOnlineStatus = (username, isOnline) => {
            dispatch(toastActions.add({
                message: `User ${isOnline ? 'online' : 'offline'} ${username}`,
                status: 'info'
            }));
            dispatch(gameActions.updatePlayerOnlineStatus({ username, isOnline }));
        };

        const onSearching = queueData => {
            dispatch(toastActions.add({
                message: 'Searching for a game...',
                status: 'info'
            }));
            dispatch(queueActions.searching({
                inQueue: queueData.inQueue,
                timeElapsed: 0
            }));
        };

        const onCancelled = () => {
            dispatch(toastActions.add({
                message: 'Search for a game has been cancelled!',
                status: 'warning'
            }));
		};

        const onQueueUpdated = queueData => {
            dispatch(queueActions.updateInQueue({
                inQueue: queueData.inQueue
            }));
        };

        const onGameStarted = gameId => {
            dispatch(toastActions.add({
                message: 'Game has started!',
                status: 'success'
            }));
            dispatch(queueActions.cancelled());
            dispatch(userActions.updateActiveGame({ gameId }));
            navigate('/games/' + gameId);
        };

        const userJoinedOrLeftGameRoomHandler = (socketName, roomSocketsCount) => {
            dispatch(gameActions.updateViewersCount({
                viewersCount: roomSocketsCount
            }));
        };

        const onGameChatMessage = chatEntry => {
            dispatch(gameActions.addChatEntry({ chatEntry }));
        };

        const onGameCancelled = (gameId, cancelledBy) => {
            dispatch(toastActions.add({
                message: cancelledBy
                    ? `The game has been cancelled by ${cancelledBy} player!`
                    : 'The game has been cancelled!',
                status: 'warning'
            }));
            dispatch(gameActions.updateStatus({
                status: cancelledBy ? ('cancelled_by_' + cancelledBy) : 'cancelled'
            }));
            if(activeGameOfUser === gameId) {
                dispatch(userActions.updateActiveGame({ gameId: null }));
            }
        };

        const onPlayerResignedFromGame = (gameId, resignedPlayer, black, white) => {
            dispatch(toastActions.add({
                message: `${resignedPlayer} player resigned from the game!`,
                status: 'warning'
            }));
            dispatch(gameActions.updateGame({
                status: resignedPlayer + '_resigned',
                black,
                white
            }));

            if(isPlayer) {
                dispatch(userActions.update({
                    elo: isBlackPlayer ? black.user.elo : white.user.elo
                }));
                dispatch(userActions.updateActiveGame({
                    activeGame: null
                }));
            }
        };

        const onUndoRequested = (requestedBy, black, white, undo) => {
            dispatch(gameActions.updateGame({
                black,
                white,
                undo
            }));
        };

        const onUndoRequestRejected = (requestedBy) => {
            dispatch(gameActions.updateGame({
                undo: {
                    requestedBy: null,
                    requestedAt: null,
                    requestEndsAt: null
                }
            }));

            if((requestedBy === 'black' && isBlackPlayer) || (requestedBy === 'white' && isWhitePlayer)) {
                dispatch(toastActions.add({
                    message: 'Undo request rejected by opponent.',
                    status: 'danger'
                }));
            }
        };

        const onUndoRequestAccepted = (requestedBy, status, board, moves, black, white) => {
            dispatch(gameActions.updateGame({
                status,
                board,
                moves,
                black,
                white,
                undo: {
                    requestedBy: null,
                    requestedAt: null,
                    requestEndsAt: null
                }
            }));

            if((requestedBy === 'black' && isBlackPlayer) || (requestedBy === 'white' && isWhitePlayer)) {
                dispatch(toastActions.add({
                    message: 'Undo request accepted by opponent.',
                    status: 'success'
                }));
            }
        };

        const onPassed = (status, moves, groups, emptyGroups, black, white) => {
            dispatch(gameActions.updateGame({
                status,
                moves,
                groups,
                emptyGroups,
                black,
                white
            }));
        };

        const onCancelledFinishing = (status, black, white) => {
            if(isPlayer) {
                dispatch(toastActions.add({
                    message: 'Finishing state has been cancelled!',
                    status: 'info'
                }));
            }

            dispatch(gameActions.updateGame({
                status,
                black,
                white
            }));
        };

        const onConfirmedFinishing = (status, black, white, whoConfirmed) => {
            if(
                (isBlackPlayer && whoConfirmed === 'white')
                || (isWhitePlayer && whoConfirmed === 'black')
            ) {
                dispatch(toastActions.add({
                    message: 'Your opponent has confirmed game\'s finishing state!',
                    status: 'info'
                }));
            }

            if(isPlayer && status.includes('_won')) {
                if(
                    (status === 'black_won' && isBlackPlayer)
                    || (status === 'white_won' && isWhitePlayer)
                ) {
                    dispatch(toastActions.add({
                        message: 'Congratulations, you have won!',
                        status: 'success'
                    }));
                } else {
                    dispatch(toastActions.add({
                        message: 'Congratulations, you have completed a game!',
                        status: 'success'
                    }));
                }

                dispatch(userActions.update({
                    elo: isBlackPlayer ? black.user.elo : white.user.elo
                }));
                dispatch(userActions.updateActiveGame({
                    activeGame: null
                }));
            }

            dispatch(gameActions.updateGame({
                status,
                black,
                white
            }));
        };

        const onNegatedGroupOrEmptyGroup = (black, white, groups, emptyGroups) => {
            dispatch(gameActions.updateGame({
                black,
                white,
                groups,
                emptyGroups
            }));
        };

        const onAddedStone = (status, black, white, board, moves) => {
            dispatch(gameActions.updateGame({
                status,
                black,
                white,
                board,
                moves,
            }));
        };

        const onGameFinished = (gameId, status, black, white) => {
            if(viewingGameId === gameId) {
                dispatch(gameActions.updateStatus({
                    status,
                }));
                dispatch(gameActions.updatePlayers({
                    black,
                    white
                }));
            }
            if(isPlayer) {
                dispatch(userActions.updateActiveGame({ gameId: null }));
            }
        };

		// General error handler
        const onErrorOccured = errorMessage => {
			dispatch(toastActions.add({
                message: errorMessage,
                status: 'danger'
            }));
		};

		// In case authentication middleware fails and throws and error
        const onConnectError = error => {
			dispatch(toastActions.add({
                message: error.message,
                status: 'danger'
            }));
			console.error(error);
        };

		socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.io.on('reconnect_attempt', onReconnectAttempt);

        socket.on('playerOnlineStatus', onPlayerOnlineStatus);

        socket.on('searching', onSearching);
		socket.on('cancelled', onCancelled);
        socket.on('queueUpdated', onQueueUpdated);
        socket.on('gameStarted', onGameStarted);
        socket.on('userJoinedGameRoom', userJoinedOrLeftGameRoomHandler);
        socket.on('userLeftGameRoom', userJoinedOrLeftGameRoomHandler);
        socket.on('gameChatMessage', onGameChatMessage);
        socket.on('gameCancelled', onGameCancelled);
        socket.on('playerResignedFromGame', onPlayerResignedFromGame);
        socket.on('undoRequested', onUndoRequested);
        socket.on('undoRequestRejected', onUndoRequestRejected);
        socket.on('undoRequestAccepted', onUndoRequestAccepted);
        socket.on('passed', onPassed);
        socket.on('cancelledFinishing', onCancelledFinishing);
        socket.on('confirmedFinishing', onConfirmedFinishing);
        socket.on('negatedGroupOrEmptyGroup', onNegatedGroupOrEmptyGroup);
        socket.on('addedStone', onAddedStone);
        socket.on('gameFinished', onGameFinished);

		socket.on('errorOccured', onErrorOccured);
		socket.on('connect_error', onConnectError);

		return () => {
			socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.io.off('reconnect_attempt', onReconnectAttempt);

            socket.off('playerOnlineStatus', onPlayerOnlineStatus);

            socket.off('searching', onSearching);
			socket.off('cancelled', onCancelled);
            socket.off('queueUpdated', onQueueUpdated);
            socket.off('gameStarted', onGameStarted);
            socket.off('userJoinedGameRoom', userJoinedOrLeftGameRoomHandler);
            socket.off('userLeftGameRoom', userJoinedOrLeftGameRoomHandler);
            socket.off('gameChatMessage', onGameChatMessage);
            socket.off('gameCancelled', onGameCancelled);
            socket.off('playerResignedFromGame', onPlayerResignedFromGame);
            socket.off('undoRequested', onUndoRequested);
            socket.off('undoRequestRejected', onUndoRequestRejected);
            socket.off('undoRequestAccepted', onUndoRequestAccepted);
            socket.off('passed', onPassed);
            socket.off('cancelledFinishing', onCancelledFinishing);
            socket.off('confirmedFinishing', onConfirmedFinishing);
            socket.off('negatedGroupOrEmptyGroup', onNegatedGroupOrEmptyGroup);
            socket.off('addedStone', onAddedStone);
            socket.off('gameFinished', onGameFinished);

			socket.off('errorOccured', onErrorOccured);
			socket.off('connect_error', onConnectError);
		};
    }, [dispatch, navigate, activeGameOfUser, viewingGameId, isBlackPlayer, isWhitePlayer, isPlayer]);

    return props.children;
};

export default WebSocketProvider;
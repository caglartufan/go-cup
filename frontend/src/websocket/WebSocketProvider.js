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
            // TODO: Update online viewers count in gameState and show on UI
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
            dispatch(gameActions.updateStatus({ status: cancelledBy ? ('cancelled_by_' + cancelledBy) : 'cancelled' }));
            if(activeGameOfUser === gameId) {
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

			socket.off('errorOccured', onErrorOccured);
			socket.off('connect_error', onConnectError);
		};
    }, [dispatch, navigate, activeGameOfUser]);

    return props.children;
};

export default WebSocketProvider;
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { toastActions } from '../store/toastSlice';
import { queueActions } from '../store/queueSlice';
import { gameActions } from '../store/gameSlice';

import { setSocketId } from '../utils/websocket';
import { socket } from '.';

const WebSocketProvider = props => {
    const { navigate } = props;
    const dispatch = useDispatch();

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
            navigate('/games/' + gameId);
        };

        const userJoinedGameRoomHandler = username => {
            dispatch(toastActions.add({
                message: `${username} has joined to the game room!`,
                status: 'info'
            }));
        };

        const onGameChatMessage = chatEntry => {
            dispatch(gameActions.addChatEntry({ chatEntry }));
        };

        const onGameCancelled = cancelledBy => {
            dispatch(toastActions.add({
                message: cancelledBy
                    ? `The game has been cancelled by ${cancelledBy} player!`
                    : 'The game has been cancelled!',
                status: 'warning'
            }));
            dispatch(gameActions.updateStatus({ status: cancelledBy ? ('cancelled_by_' + cancelledBy) : 'cancelled' }));
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

        socket.on('searching', onSearching);
		socket.on('cancelled', onCancelled);
        socket.on('queueUpdated', onQueueUpdated);
        socket.on('gameStarted', onGameStarted);
        socket.on('userJoinedGameRoom', userJoinedGameRoomHandler);
        socket.on('gameChatMessage', onGameChatMessage);
        socket.on('gameCancelled', onGameCancelled);

		socket.on('errorOccured', onErrorOccured);
		socket.on('connect_error', onConnectError);

		return () => {
			socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.io.off('reconnect_attempt', onReconnectAttempt);

            socket.off('searching', onSearching);
			socket.off('cancelled', onCancelled);
            socket.off('queueUpdated', onQueueUpdated);
            socket.off('gameStarted', onGameStarted);
            socket.off('userJoinedGameRoom', userJoinedGameRoomHandler);
            socket.off('gameChatMessage', onGameChatMessage);
            socket.off('gameCancelled', onGameCancelled);

			socket.off('errorOccured', onErrorOccured);
			socket.off('connect_error', onConnectError);
		};
    }, [dispatch, navigate]);

    return props.children;
};

export default WebSocketProvider;
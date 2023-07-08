import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { toastActions } from '../store/toastSlice';
import { queueActions } from '../store/queueSlice';

import { setSocketId } from '../utils/websocket';
import { socket } from '.';

const WebSocketProvider = props => {
    const dispatch = useDispatch();

	useEffect(() => {
		socket.on('connect', () => {
            setSocketId(socket.id);
			dispatch(toastActions.add({
                message: 'Connected to websocket server!'
            }));
            console.log('Connected with id: ' + socket.id);
		});

        socket.on('disconnect', (reason, details) => {
            dispatch(toastActions.add({
                message: 'Disconnected from websocket server due to reason ' + reason,
                status: 'danger'
            }));
        });

        socket.io.on('reconnect_attempt', attemptNumber => {
            if(attemptNumber === 1) {
                dispatch(toastActions.add({
                    message: 'Reconnecting to websocket server...',
                    status: 'info'
                }));
            }
        });

        socket.on('searching', queueData => {
            dispatch(toastActions.add({
                message: 'Searching for a game...',
                status: 'info'
            }));
            dispatch(queueActions.searching({
                inQueue: queueData.inQueue,
                timeElapsed: 0
            }));
        });

		socket.on('cancelled', () => {
            dispatch(toastActions.add({
                message: 'Search for a game has been cancelled!',
                status: 'warning'
            }));
		});

        socket.on('queueUpdated', queueData => {
            dispatch(queueActions.updateInQueue({
                inQueue: queueData.inQueue
            }));
        });

		// General error handler
		socket.on('errorOccured', errorMessage => {
			dispatch(toastActions.add({
                message: errorMessage,
                status: 'danger'
            }));
		});

		// In case authentication middleware fails and throws and error
		socket.on('connect_error', error => {
			dispatch(toastActions.add({
                message: error.message,
                status: 'danger'
            }));
			console.error(error);
        });

		return () => {
			socket.off('connect');
            socket.off('disconnect');
            socket.io.off('reconnect_attempt');
            socket.off('searching');
			socket.off('cancelled');
            socket.off('queueUpdated');
			socket.off('errorOccured');
			socket.off('connect_error');
		};
	}, [dispatch]);

    return props.children;
};

export default WebSocketProvider;
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toastActions } from '../store/toastSlice';

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

		socket.on('matched', () => {
            console.log('matched!');
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
			socket.off('matched');
			socket.off('errorOccured');
			socket.off('connect_error');
		};
	}, [dispatch]);

    return props.children;
};

export default WebSocketProvider;
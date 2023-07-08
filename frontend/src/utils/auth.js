import { redirect } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { store } from '../store/store';
import { userActions } from '../store/userSlice';
import { toastActions } from '../store/toastSlice';
import { socket } from '../websocket';
import { queueActions } from '../store/queueSlice';

export const AUTH_TOKEN_KEY = 'auth-token';

export const getAuthTokenDuration = () => {
    const token = getAuthToken();

    if(token) {
        const { exp: expirationSeconds } = jwtDecode(token);
        const expirationTimestamp = expirationSeconds*1000;

        return expirationTimestamp - Date.now();
    } else {
        return 0;
    }
};

export const setAuthToken = token => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if(!token) {
        return null;
    }

    return token;
};

export const deleteAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const authLoader = async () => {
    const token = getAuthToken();

    if(!token) {
        return null;
    }

    const duration = getAuthTokenDuration();
    
    if(duration <= 0) {
        deleteAuthToken();
        return null;
    }

    const { user: storedUser } = store.getState();
    if(storedUser.username && storedUser.email) {
        return null;
    }

    const response = await fetch('http://localhost:3000/api/users/me', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const resData = await response.json();

    if(!response.ok) {
        if(resData?.message) {
            return resData;
        } else {
            return { message: 'Could not fetch profile data!' };
        }
    }

    const user = resData.user;

    if(!user) {
        return { message: 'Could not fetch profile data!' };
    }

    store.dispatch(userActions.update(user));

    if(user.isInQueue) {
        // TODO: Get queue data from websocket server and update queue slice
        const { inQueue, timeElapsed } = await socket.emitWithAck('fetchQueueData');
        store.dispatch(queueActions.searching({
            inQueue,
            timeElapsed
        }));
    }

    return null;
};

export const logoutAction = () => {
    store.dispatch(userActions.logout());

    deleteAuthToken();

    store.dispatch(toastActions.add({
        message: 'Logged out!',
        status: 'info'
    }));

    socket.emit('loggedOut');

    return redirect('/');
};

export const authMiddleware = () => {
    const token = getAuthToken();

    if(!token) {
        return redirect('/login');
    }

    return null;
};

export const noAuthMiddleware = () => {
    const token = getAuthToken();

    if(token) {
        return redirect('/');
    }

    return null;
};
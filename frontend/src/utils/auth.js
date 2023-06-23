import { redirect } from 'react-router-dom';
import { store } from '../store/store';
import { userActions } from '../store/userSlice';

export const AUTH_TOKEN_KEY = 'auth-token';

export const setAuthToken = token => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

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

export const authLoader = () => {
    return getAuthToken();
}

export const logoutAction = () => {
    store.dispatch(userActions.logout());

    deleteAuthToken();

    return redirect('/');
};
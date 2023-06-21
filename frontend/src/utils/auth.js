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
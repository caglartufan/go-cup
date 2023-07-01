export const setSocketId = (id) => {
    localStorage.setItem('socket-id', id);
};

export const getSocketId = () => {
    return localStorage.getItem('socket-id');
};
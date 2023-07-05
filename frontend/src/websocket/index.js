import { io } from 'socket.io-client';
import { getAuthToken } from '../utils/auth';

const URL = 'http://localhost:3000';

const options = {
    auth: {
        token: getAuthToken()
    }
};

export const socket = io(URL, options);
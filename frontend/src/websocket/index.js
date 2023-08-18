import { io } from 'socket.io-client';
import { getAuthToken } from '../utils/auth';
import { BASE_URL } from '../utils/helpers';

const URL = BASE_URL;

const options = {
    auth: {
        token: getAuthToken()
    }
};

export const socket = io(URL, options);
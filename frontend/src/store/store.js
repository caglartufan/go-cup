import { configureStore } from '@reduxjs/toolkit';

import userSlice from './userSlice';
import loginFormSlice from './loginFormSlice';
import signupFormSlice from './signupFormSlice';
import toastSlice from './toastSlice';
import queueSlice from './queueSlice';
import gamesListSlice from './gamesListSlice';
import gameSlice from './gameSlice';
import gamesListFormSlice from './gamesListFormSlice';

export const store = configureStore({
    reducer: {
        'user': userSlice,
        'login-form': loginFormSlice,
        'signup-form': signupFormSlice,
        'games-list-form': gamesListFormSlice,
        'toast': toastSlice,
        'queue': queueSlice,
        'games-list': gamesListSlice,
        'game': gameSlice
    }
});
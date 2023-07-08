import { configureStore } from '@reduxjs/toolkit';

import userSlice from './userSlice';
import loginFormSlice from './loginFormSlice';
import signupFormSlice from './signupFormSlice';
import toastSlice from './toastSlice';
import queueSlice from './queueSlice';

export const store = configureStore({
    reducer: {
        'user': userSlice,
        'login-form': loginFormSlice,
        'signup-form': signupFormSlice,
        'toast': toastSlice,
        'queue': queueSlice
    }
});
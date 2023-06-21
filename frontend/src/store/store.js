import { configureStore } from '@reduxjs/toolkit';

import loginFormSlice from './loginFormSlice';
import userSlice from './userSlice';

export const store = configureStore({
    reducer: {
        'user': userSlice,
        'login-form': loginFormSlice
    }
});
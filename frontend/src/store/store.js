import { configureStore } from '@reduxjs/toolkit';

import loginFormSlice from './loginFormSlice';

export const store = configureStore({
    reducer: {
        'login-form': loginFormSlice
    }
});
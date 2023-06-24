import { createSlice } from '@reduxjs/toolkit';
import { formReducers } from './formReducers';

const initialLoginFormState = {
    isFormValid: false,
    inputs: {
        login: {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true // initially => isValid || !isInputTouched = true
        },
        password: {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true  // initially => isValid || !isInputTouched = true
        }
    }
};

const loginFormSlice = createSlice({
    name: 'login-form',
    initialState: initialLoginFormState,
    reducers: formReducers(initialLoginFormState)
});

export const loginFormActions = loginFormSlice.actions;
export default loginFormSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import { formReducers } from './formReducers';

const initialSignupFormState = {
    isFormValid: false,
    inputs: {
        username: {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true // initially => isValid || !isInputTouched = true
        },
        email: {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true
        },
        password: {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true
        },
        'password-confirmation': {
            value: '',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true
        }
    }
};

const signupFormSlice = createSlice({
    name: 'signup-form',
    initialState: initialSignupFormState,
    reducers: formReducers(initialSignupFormState)
});

export const signupFormActions = signupFormSlice.actions;
export default signupFormSlice.reducer;
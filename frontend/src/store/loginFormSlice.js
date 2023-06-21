import { createSlice } from '@reduxjs/toolkit';

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
    reducers: {
        updateValue: (state, action) => {
            const input = action.payload.input;
            const value = action.payload.value;

            // Update given input's value
            state.inputs[input].value = value;
        },
        updateValidityAndMessage: (state, action) => {
            const input    = action.payload.input;
            const isValid  = action.payload.isValid;
            const message  = action.payload.message;

            // Update given input's isValid and message states
            state.inputs[input].isValid = isValid;
            state.inputs[input].message = message;

            // Calculate form's overall validity by checking if login.isValid && password.isValid
            state.isFormValid = Object
                .values(state.inputs)
                .map(input => input.isValid)
                .reduce((isFormValid, isValid) => isFormValid && isValid, true);

            // Update given input's isInputValid state with updated isValid state
            state.inputs[input].isInputValid = isValid || !state.inputs[input].isInputTouched;
        },
        updateIsInputTouched: (state, action) => {
            const input          = action.payload.input;
            const isInputTouched = action.payload.isInputTouched;

            // Update given input's isInputTouched state
            state.inputs[input].isInputTouched = isInputTouched;

            // Update given input's isInputValid state with updated isInputTouched state
            state.inputs[input].isInputValid = state.inputs[input].isValid || !isInputTouched;
        },
        reset: (state, action) => {
            const input = action.payload;

            // Reset given input to it's initial state
            state.inputs[input] = initialLoginFormState.inputs[input];
        }
    }
});

export const loginFormActions = loginFormSlice.actions;
export default loginFormSlice.reducer;
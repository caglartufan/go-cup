import { createSlice } from '@reduxjs/toolkit';
import { formReducers } from './formReducers';

const initialGamesListFormState = {
    isFormValid: false,
    inputs: {
        size: {
            value: 'all-sizes',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true // initially => isValid || !isInputTouched = true
        },
        'elo-range': {
            value: 'all-elos',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true  // initially => isValid || !isInputTouched = true
        },
        'started-at-order': {
            value: 'desc',
            isValid: false,
            message: null,
            isInputTouched: false,
            isInputValid: true  // initially => isValid || !isInputTouched = true
        }
    }
};

const gamesListFormSlice = createSlice({
    name: 'games-list-form',
    initialState: initialGamesListFormState,
    reducers: formReducers(initialGamesListFormState)
});

export const gamesListFormActions = gamesListFormSlice.actions;
export default gamesListFormSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const toastInitialState = [];

const toastSlice = createSlice({
    name: 'toast',
    initialState: toastInitialState,
    reducers: {
        add: (state, action) => {
            state.push({
                message: action.payload.message,
                status: action.payload.status,
                delay: action.payload.delay
            });
        },
        remove: (state, action) => {
            const messageIndex = state.findIndex(
                message => (
                    message.message === action.payload.message
                    && message.status === action.payload.status
                )
            );

            state.splice(messageIndex, 1);
        }
    }
});

export const toastActions = toastSlice.actions;
export default toastSlice.reducer;
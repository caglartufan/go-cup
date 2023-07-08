import { createSlice } from '@reduxjs/toolkit';

const queueInitialState = {
    isInQueue: false,
    inQueue: 0,
    timeElapsed: 0
};

const queueSlice = createSlice({
    name: 'queue',
    initialState: queueInitialState,
    reducers: {
        searching: (state, action) => {
            state.isInQueue = true;
            state.inQueue = action.payload.inQueue;
            state.timeElapsed = action.payload.timeElapsed;
        },
        cancelled: state => {
            return queueInitialState;
        },
        updateInQueue: (state, action) => {
            state.inQueue = action.payload.inQueue;
        }
    }
});

export const queueActions = queueSlice.actions;
export default queueSlice.reducer;
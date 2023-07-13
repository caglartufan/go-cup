import { createSlice } from '@reduxjs/toolkit';

const initialGameState = {
    _id: null,
    size: null,
    status: null,
    black: null,
    white: null,
    isPrivate: null,
    board: null,
    moves: [],
    chat: [],
    waitingEndsAt: null,
    createdAt: null
};

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        updateGame: (state, action) => {
            state._id = action.payload._id;
            state.size = action.payload.size;
            state.status = action.payload.status;
            state.black = action.payload.black;
            state.white = action.payload.white;
            state.isPrivate = action.payload.isPrivate;
            state.board = action.payload.board;
            state.moves = action.payload.moves;
            state.chat = action.payload.chat;
            state.waitingEndsAt = action.payload.waitingEndsAt;
            state.createdAt = action.payload.createdAt;
        },
        updateStatus: (state, action) => {
            state.status = action.payload.status;
        },
        addChatEntry: (state, action) => {
            state.chat.push(action.payload.chatEntry);
        }
    }
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
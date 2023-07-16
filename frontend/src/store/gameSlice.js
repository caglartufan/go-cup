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
    startedAt: null,
    finishedAt: null,
    waitingEndsAt: null,
    createdAt: null,
    viewersCount: 0
};

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        updateGame: (state, action) => {
            state._id = action.payload._id || state._id;
            state.size = action.payload.size || state.size;
            state.status = action.payload.status || state.status;
            state.black = action.payload.black || state.black;
            state.white = action.payload.white || state.white;
            state.isPrivate = action.payload.isPrivate || state.isPrivate;
            state.board = action.payload.board || state.board;
            state.moves = action.payload.moves || state.moves;
            state.chat = action.payload.chat || state.chat;
            state.startedAt = action.payload.startedAt || state.startedAt;
            state.finishedAt = action.payload.finishedAt || state.finishedAt;
            state.waitingEndsAt = action.payload.waitingEndsAt || state.waitingEndsAt;
            state.createdAt = action.payload.createdAt || state.createdAt;
        },
        updateStatus: (state, action) => {
            state.status = action.payload.status;
        },
        addChatEntry: (state, action) => {
            state.chat.push(action.payload.chatEntry);
        },
        updatePlayerOnlineStatus: (state, action) => {
            const usernameOfPlayerToBeUpdated = action.payload.username;
            const onlineStatus = action.payload.isOnline; // true for online, false for offline

            if(state.white?.user?.username === usernameOfPlayerToBeUpdated) {
                state.white.user.isOnline = onlineStatus;
            }

            if(state.black?.user?.username === usernameOfPlayerToBeUpdated) {
                state.black.user.isOnline = onlineStatus;
            }
        },
        reset: state => {
            return initialGameState;
        },
        updateViewersCount: (state, action) => {
            state.viewersCount = action.payload.viewersCount;
        },
        updatePlayers: (state, action) => {
            if(action.payload.black) {
                state.black = { ...state.black, ...action.payload.black };
            }
            if(action.payload.white) {
                state.white = { ...state.white, ...action.payload.white };
            }
        }
    }
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
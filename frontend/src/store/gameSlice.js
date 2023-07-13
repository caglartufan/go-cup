import { createSlice } from '@reduxjs/toolkit';

const initialGameState = {
    game: null
};

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        updateGame: (state, action) => {
            state.game = action.payload.game;
        },
        updateStatus: (state, action) => {
            state.game.status = action.payload.status;
        },
        addChatEntry: (state, action) => {
            if(state.game?.chat) {
                state.game.chat.push(action.payload.chatEntry);
            }
        }
    }
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
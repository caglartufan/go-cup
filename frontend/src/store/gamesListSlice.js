import { createSlice } from '@reduxjs/toolkit';

const initialGamesListState = {
    total: 0,
    games: []
};

const gamesListSlice = createSlice({
    name: 'games-list',
    initialState: initialGamesListState,
    reducers: {
        load: (state, action) => {
            state.total = action.payload.total;
            state.games = action.payload.games;
        }
    }
});

export const gamesListActions = gamesListSlice.actions;
export default gamesListSlice.reducer;
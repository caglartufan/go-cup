import { createSlice } from '@reduxjs/toolkit';

const initialGamesListState = {
    total: 0,
    games: [],
    page: 1,
    totalPages: 0
};

const gamesListSlice = createSlice({
    name: 'games-list',
    initialState: initialGamesListState,
    reducers: {
        load: (state, action) => {
            state.total = action.payload.total;
            state.games = action.payload.games;
            state.totalPages = action.payload.totalPages;
        }
    }
});

export const gamesListActions = gamesListSlice.actions;
export default gamesListSlice.reducer;
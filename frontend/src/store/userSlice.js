import { createSlice } from '@reduxjs/toolkit';

const initialUserState = {
    _id: null,
    username: null,
    avatar: null,
    firstname: null,
    lastname: null,
    email: null,
    country: null,
    games: [],
    activeGame: null,
    elo: null,
    createdAt: null
};

const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        update: (state, action) => {
            state.username = action.payload.username || state.username;
            state.avatar = action.payload.avatar || state.avatar;
            state.firstname = action.payload.firstname || state.firstname;
            state.lastname = action.payload.lastname || state.lastname;
            state.email = action.payload.email || state.email;
            state.country = action.payload.country || state.country;
            state.games = action.payload.games || state.games;
            state.activeGame = action.payload.activeGame || state.activeGame;
            state.elo = action.payload.elo || state.elo;
            state.createdAt = action.payload.createdAt || state.createdAt;
        },
        updateActiveGame: (state, action) => {
            const activeGameId = action.payload.gameId;
            
            if(activeGameId) {
                state.activeGame = activeGameId;
                state.games.push(activeGameId);
            } else {
                state.activeGame = null;
            }
        },
        logout: (state) => {
            return initialUserState;
        }
    }
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
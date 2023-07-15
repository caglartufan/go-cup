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
            if(action.payload.username) {
                state.username = action.payload.username;
            }
            if(action.payload.avatar) {
                state.avatar = action.payload.avatar;
            }
            if(action.payload.firstname) {
                state.firstname = action.payload.firstname;
            }
            if(action.payload.lastname) {
                state.lastname = action.payload.lastname;
            }
            if(action.payload.email) {
                state.email = action.payload.email;
            }
            if(action.payload.country) {
                state.country = action.payload.country;
            }
            if(action.payload.games) {
                state.games = action.payload.games;
            }
            if(action.payload.activeGame) {
                state.activeGame = action.payload.activeGame;
            }
            if(action.payload.elo) {
                state.elo = action.payload.elo;
            }
            if(action.payload.createdAt) {
                state.createdAt = action.payload.createdAt;
            }
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
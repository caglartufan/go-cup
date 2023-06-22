import { createSlice } from '@reduxjs/toolkit';

const initialUserState = {
    _id: null,
    username: null,
    avatar: null,
    firstname: null,
    lastname: null,
    email: null,
    country: null,
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
            if(action.payload.username) {
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
            if(action.payload.createdAt) {
                state.createdAt = action.payload.createdAt;
            }
        }
    }
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
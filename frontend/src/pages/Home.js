import { store } from '../store/store';
import { gamesListActions } from '../store/gamesListSlice';

import GamesList from '../components/Games/GamesList';

const HomePage = () => {
    // TODO: Defer loading
    return (
        <GamesList />
    );
};

export const loader = async () => {
    const response = await fetch('http://localhost:3000/api/games');

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    store.dispatch(gamesListActions.load(resData));

    return null;
};

export default HomePage;
import { store } from '../store/store';
import { gamesListActions } from '../store/gamesListSlice';

import GamesList from '../components/Games/GamesList';

const GamesPage = () => {
    // TODO: Defer loading
    return (
        <GamesList filters={true} />
    );
};

export const loader = async ({ request }) => {
    const state = store.getState();
    const gamesListFormInputs = state['games-list-form'].inputs;
    const sizeFilter = gamesListFormInputs.size.value;
    const eloRangeFilter = gamesListFormInputs['elo-range'].value;
    const startedAtOrder = gamesListFormInputs['started-at-order'].value;
    const page = state['games-list'].page;

    const requestUrl = new URL('http://localhost:3000/api/games');
    requestUrl.searchParams.set('size', sizeFilter);
    requestUrl.searchParams.set('elo-range', eloRangeFilter);
    requestUrl.searchParams.set('started-at-order', startedAtOrder);
    requestUrl.searchParams.set('page', page);
    console.log(sizeFilter, eloRangeFilter,startedAtOrder, page, requestUrl.toString());
    
    const response = await fetch(requestUrl);

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    store.dispatch(gamesListActions.load(resData));

    return null;
};

export default GamesPage;
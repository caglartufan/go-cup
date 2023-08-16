import { store } from '../../store/store';
import { gamesListActions } from '../../store/gamesListSlice';

import GamesList from '../../components/Games/GamesList';
import { gamesListFormActions } from '../../store/gamesListFormSlice';

const GamesPage = () => {
    // TODO: Defer loading
    return (
        <GamesList filters={true} />
    );
};

export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const urlSizeFilter = url.searchParams.get('size');
    const urlEloRangeFilter = url.searchParams.get('elo-range');
    const urlStartedAtOrder = url.searchParams.get('started-at-order');
    const urlPage = url.searchParams.get('page');

    const state = store.getState();
    const gamesListFormInputs = state['games-list-form'].inputs;

    let sizeFilter = gamesListFormInputs.size.value;
    if(urlSizeFilter) {
        sizeFilter = urlSizeFilter;

        store.dispatch(gamesListFormActions.updateValue({
            input: 'size',
            value: urlSizeFilter
        }));
    }

    let eloRangeFilter = gamesListFormInputs['elo-range'].value;
    if(urlEloRangeFilter) {
        eloRangeFilter = urlEloRangeFilter;

        store.dispatch(gamesListFormActions.updateValue({
            input: 'elo-range',
            value: urlEloRangeFilter
        }));
    }

    let startedAtOrder = gamesListFormInputs['started-at-order'].value;
    if(urlStartedAtOrder) {
        startedAtOrder = urlStartedAtOrder;

        store.dispatch(gamesListFormActions.updateValue({
            input: 'started-at-order',
            value: urlStartedAtOrder
        }));
    }

    let page = state['games-list'].page;
    if(urlPage) {
        page = urlPage;

        store.dispatch(gamesListActions.changePage({
            page
        }));
    }

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
import { useLoaderData } from 'react-router-dom';

import Row from '../layout/Grid/Row';
import Container from '../layout/Grid/Container';
import Column from '../layout/Grid/Column';
import Board from '../components/Games/Board';


const GameDetailPage = () => {
    const loaderData = useLoaderData(); // {ok: true, game: ...}

    return (
        <Container fluid fillVertically>
            <Row columns={2} className="h-100">
                <Column size={8} className="h-100">
                    <Board size={loaderData.game.size} state={loaderData.game.board} dynamicHeight />
                </Column>
                <Column size={4}>
                    2
                </Column>
            </Row>
        </Container>
    );
};

export const loader = async ({ params }) => {
    const response = await fetch('http://localhost:3000/api/games/' + params.gameId);

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    // store.dispatch(gamesListActions.load(resData));

    return resData;
};

export default GameDetailPage;
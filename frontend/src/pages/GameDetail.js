import { redirect, useLoaderData } from 'react-router-dom';

import { store } from '../store/store';

import Row from '../layout/Grid/Row';
import Container from '../layout/Grid/Container';
import Column from '../layout/Grid/Column';
import Board from '../components/Games/Board';
import { toastActions } from '../store/toastSlice';
import Card from '../components/UI/Card';


const GameDetailPage = () => {
    const { game } = useLoaderData(); // {ok: true, game: ...}

    return (
        <Container fluid fillVertically>
            <Row columns={2} className="h-100">
                <Column size={7} className="h-100">
                    <Board size={game.size} state={game.board} dynamicHeight />
                </Column>
                <Column size={5}>
                    <Row>
                        <Column>
                            <Card color="success" className="card-player-black">
                                Black
                            </Card>
                        </Column>
                        <Column>
                            <Card color="success">
                                White
                            </Card>
                        </Column>
                    </Row>
                    <div>
                        Chat
                    </div>
                </Column>
            </Row>
        </Container>
    );
};

export const loader = async ({ params }) => {
    const response = await fetch('http://localhost:3000/api/games/' + params.gameId);

    const resData = await response.json();

    if(!response.ok && !response.game) {
        store.dispatch(toastActions.add({
            message: 'Game could not found!',
            status: 'danger',
            delay: false
        }));
    
        return redirect('/');
    }

    return resData;
};

export default GameDetailPage;
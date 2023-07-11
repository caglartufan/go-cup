import { redirect, useLoaderData } from 'react-router-dom';

import { store } from '../store/store';
import { toastActions } from '../store/toastSlice';

import Row from '../layout/Grid/Row';
import Container from '../layout/Grid/Container';
import Column from '../layout/Grid/Column';
import Board from '../components/Games/Board';

import './GameDetail.scss';
import PlayerCard from '../components/Games/PlayerCard';
import Chat from '../components/Games/Chat';


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
                            <PlayerCard
                                color="black"
                                username={game.black.user.username}
                                elo={game.black.user.elo}
                                avatar={game.black.user.avatar}
                                time-remaining={game.black.timeRemaining}
                                score={game.black.score}
                                active={true}
                            />
                        </Column>
                        <Column>
                            <PlayerCard
                                color="white"
                                username={game.white.user.username}
                                elo={game.white.user.elo}
                                avatar={game.white.user.avatar}
                                time-remaining={game.white.timeRemaining}
                                score={game.white.score}
                            />
                        </Column>
                    </Row>
                    <Chat />
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
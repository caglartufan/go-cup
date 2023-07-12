import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'react-router-dom';
import { formatSeconds } from '../utils/helpers';

import { store } from '../store/store';
import { toastActions } from '../store/toastSlice';
import { gameActions } from '../store/gameSlice';
import { socket } from '../websocket';

import Row from '../layout/Grid/Row';
import Container from '../layout/Grid/Container';
import Column from '../layout/Grid/Column';
import Board from '../components/Games/Board';
import Button from '../components/UI/Button';
import PlayerCard from '../components/Games/PlayerCard';
import Chat from '../components/Games/Chat';

import './GameDetail.scss';

let interval;

const GameDetailPage = () => {
    const game = useSelector(state => state.game.game);
    const [timeRemaining, setTimeRemaining] = useState(() => {
        if(game.status === 'waiting') {
            const waitingEndsAt = new Date(game.waitingEndsAt);
            const waitingTimeoutInSeconds = Math.floor((waitingEndsAt - Date.now()) / 1000);

            return waitingTimeoutInSeconds;
        }
    });

    useEffect(() => {
        interval = setInterval(() => {
            setTimeRemaining(prevTimeRemaining => prevTimeRemaining - 1);
        }, 1000);

        return () => {
            // TODO: Leave game room upon leaving the game detail page
            clearInterval(interval);
        };
    }, []);

    return (
        <Container fluid fillVertically>
            <Row columns={2} className="h-100">
                <Column size={7} style={{ height: 'calc(100% - 7.3rem)' }}>
                    <h2 className="board-heading">
                        {game.status === 'waiting' && `Waiting for black to play (${formatSeconds(timeRemaining)})`}
                    </h2>
                    <Board size={game.size} state={game.board} className="mb-4" dynamicHeight />
                    <div className="board-options">
                        <Button>
                            Resign
                        </Button>
                        <Button>
                            Pass
                        </Button>
                        <Button>
                            Undo
                        </Button>
                        {game.status === 'waiting' && (
                            <Button>
                                Cancel game
                            </Button>
                        )}
                    </div>
                </Column>
                <Column size={5}>
                    <div className="d-flex flex-column h-100">
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

    store.dispatch(gameActions.updateGame({ game: resData.game }));

    const { user } = store.getState();
    if(user.username && user.email) {
        socket.emit('joinGameRoom', resData.game._id);
    }

    return null;
};

export default GameDetailPage;
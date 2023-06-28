import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';
import GamesListItem from './GamesListItem';

const dummyGames = [
    {
        id: 'g1',
        status: 'started',
        size: 9,
        board: Array.from(new Array(9), () => Array.from(new Array(9), () => Math.random() < .5)),
        white: {
            id: 'p1',
            username: 'player1',
            elo: 25,
            score: 0,
            timeRemaining: 5 * 60,
        },
        black: {
            id: 'p2',
            username: 'player2',
            elo: 50,
            score: 0,
            timeRemaining: 5 * 60
        }
    },
    {
        id: 'g2',
        status: 'starting',
        size: 9,
        board: Array.from(new Array(9), () => Array.from(new Array(9), () => Math.random() < .5)),
        white: {
            id: 'p3',
            username: 'player3',
            elo: 75,
            score: 0,
            timeRemaining: 5 * 60,
        },
        black: {
            id: 'p4',
            username: 'player4',
            elo: 100,
            score: 0,
            timeRemaining: 5 * 60
        }
    },
    {
        id: 'g3',
        status: 'finished',
        size: 9,
        board: Array.from(new Array(9), () => Array.from(new Array(9), () => Math.random() < .5)),
        white: {
            id: 'p5',
            username: 'player5',
            elo: 125,
            score: 53,
            timeRemaining: 13,
        },
        black: {
            id: 'p6',
            username: 'player6',
            elo: 150,
            score: 67,
            timeRemaining: 53
        }
    },
    {
        id: 'g4',
        status: 'started',
        size: 19,
        board: Array.from(new Array(19), () => Array.from(new Array(19), () => Math.random() < .5)),
        white: {
            id: 'p7',
            username: 'player7',
            elo: 125,
            score: 53,
            timeRemaining: 13,
        },
        black: {
            id: 'p8',
            username: 'player8',
            elo: 150,
            score: 67,
            timeRemaining: 53
        }
    },
    {
        id: 'g5',
        status: 'started',
        size: 13,
        board: Array.from(new Array(13), () => Array.from(new Array(13), () => Math.random() < .5)),
        white: {
            id: 'p9',
            username: 'player9',
            elo: 125,
            score: 27,
            timeRemaining: 129,
        },
        black: {
            id: 'p10',
            username: 'player10',
            elo: 150,
            score: 21,
            timeRemaining: 215
        }
    }
];

const GamesList = () => {
    return (
        <Container>
            <Row columns={3}>
                {dummyGames.map(game => (
                    <Column key={game.id}>
                        <GamesListItem game={game} />
                    </Column>
                ))}
            </Row>
        </Container>
    );
}

export default GamesList;
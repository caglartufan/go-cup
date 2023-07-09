import { useSelector } from 'react-redux';

import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';
import GamesListItem from './GamesListItem';

const GamesList = () => {
    const gamesList = useSelector(state => state['games-list']);

    return (
        <Container>
            {gamesList.total > 0 ? (
                <Row columns={3}>
                    {gamesList.games.map(game => (
                        <Column key={game._id}>
                            <GamesListItem game={game} />
                        </Column>
                    ))}
                </Row>
            ) : (
                <Row>
                    <Column className="text-center">
                        {/* TODO: Add a button to refresh list */}
                        No games being played at the moment.
                    </Column>
                </Row>
            )}
        </Container>
    );
}

export default GamesList;
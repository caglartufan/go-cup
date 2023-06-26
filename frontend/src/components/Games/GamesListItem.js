import { Link } from 'react-router-dom';
import { formatSeconds } from '../../utils/helpers';

import Board from './Board';

import './GamesListItem.scss';

const GamesListItem = props => {
    const {
        game
    } = props;
    return (
        <Link className="games-list-item" to={`/games/${game.id}`}>
            <div className="games-list-item__player-preview games-list-item__player-preview--white">
                <span>
                    {game.white.username} ({game.white.elo})
                </span>
                <span>
                    Score: {game.white.score}, {formatSeconds(game.white.timeRemaining)} remaining
                </span>
            </div>
            <Board state={game.board} />
            <div className="games-list-item__player-preview games-list-item__player-preview--black">
                <span>
                    {game.black.username} ({game.black.elo})
                </span>
                <span>
                    Score: {game.black.score}, {formatSeconds(game.black.timeRemaining)} remaining
                </span>
            </div>
        </Link>
    );
}

export default GamesListItem;
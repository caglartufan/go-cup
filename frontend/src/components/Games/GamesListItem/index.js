import { Link } from 'react-router-dom';
import { formatSeconds } from '../../../utils/helpers';

import Board from '../Board';

import './style.scss';

const GamesListItem = props => {
    const {
        game
    } = props;
    // TODO: Subscribe to the game being played, update board on boardUpdate event etc.
    // Dont forget to clean the listeners in useEffect to make sure listeners are
    // removed when this GameListItem component dismounts, and make sure this socket
    // is no more in the spectators room in websocket server !!!

    return (
        <Link className="games-list-item" to={'/games/' + game._id}>
            <div className="games-list-item__player-preview games-list-item__player-preview--white">
                <span>
                    {game.white.user.username} ({game.white.user.elo})
                </span>
                <span>
                    Score: {game.white.score}, {formatSeconds(game.white.timeRemaining)} remaining
                </span>
            </div>
            <Board size={game.size} state={game.board} />
            <div className="games-list-item__player-preview games-list-item__player-preview--black">
                <span>
                    {game.black.user.username} ({game.black.user.elo})
                </span>
                <span>
                    Score: {game.black.score}, {formatSeconds(game.black.timeRemaining)} remaining
                </span>
            </div>
        </Link>
    );
}

export default GamesListItem;
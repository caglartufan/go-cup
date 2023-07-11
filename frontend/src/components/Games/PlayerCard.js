import { Link } from 'react-router-dom';
import { formatSeconds } from '../../utils/helpers';

import Card from '../UI/Card';

import './PlayerCard.scss';

const PlayerCard = props => {
    const {
        username,
        elo,
        avatar,
        'time-remaining': timeRemaining,
        score,
        color,
        active
    } = props;

    let className = 'player-card player-card--' + color;

    if(active) {
        className = `${className} active`;
    }

    return (
        <Card box-shadow="light" className={className}>
            <div className="player-card__avatar-container">
                <img
                    src={'http://localhost:3000' + avatar}
                    alt={username} className="player-card__avatar"
                />
            </div>
            <div className="player-card__meta">
                {/* TODO: Add a button to report user (afk, inappropriate language etc.) */}
                <Link to={'/users/' + username} className="player-card__name">
                    {username} ({elo})
                </Link>
                <span className="player-card__score">
                    {score} points
                </span>
                <span className="player-card__time-remaining">
                    {formatSeconds(timeRemaining)} remaining
                </span>
            </div>
        </Card>
    );
};

export default PlayerCard;
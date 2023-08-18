import { Link } from 'react-router-dom';
import { BASE_URL, formatSeconds } from '../../../utils/helpers';

import Card from '../../UI/Card';

import './style.scss';

const PlayerCard = props => {
    const {
        username,
        elo,
        avatar,
        'time-remaining': timeRemaining,
        score,
        'is-online': isOnline,
        color,
        active
    } = props;

    let className = 'player-card player-card--' + color;

    if(active) {
        className = `${className} active`;
    }

    return (
        <Card box-shadow="light" className={className}>
            <div className="player-card__avatar">
                <img
                    src={BASE_URL + avatar}
                    alt={username} className="player-card__avatar-image"
                />
                <span className={`player-card__avatar-badge player-card__avatar-badge--${isOnline ? 'online' : 'offline'}`}></span>
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
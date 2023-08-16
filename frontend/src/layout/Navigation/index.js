import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { socket } from '../../websocket';

import MiniProfile from '../MiniProfile';

import './style.scss';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isUserAuthenticated = useSelector(state => state.user.username && state.user.email);
    const activeGame = useSelector(state => state.user.activeGame);
    const isUserAlreadyInQueue = useSelector(state => state.queue.isInQueue);

    const playHandler = useCallback(() => {
        if(activeGame) {
            navigate('/games/' + activeGame);
        } else {
            // TODO: Ask for preferences in a modal and send it
            socket.emit('play', {});
        }
    }, [navigate, activeGame]);

    return (
        <nav className="navigation">
            <ul className="navigation__list">
                <li className="navigation__list-item">
                    <NavLink
                        to="/"
                        className={
                            ({ isActive }) => isActive
                                ? 'navigation__list-item-link navigation__list-item-link--active'
                                : 'navigation__list-item-link'
                        }
                        end
                    >
                        Home
                    </NavLink>
                </li>
                <li className="navigation__list-item">
                    <NavLink
                        to="/games"
                        className={
                            ({ isActive }) => isActive
                                ? 'navigation__list-item-link navigation__list-item-link--active'
                                : 'navigation__list-item-link'
                        }
                    >
                        Games
                    </NavLink>
                </li>
                <li className="navigation__list-item">
                    <NavLink
                        to="/leaderboard"
                        className={
                            ({ isActive }) => isActive
                                ? 'navigation__list-item-link navigation__list-item-link--active'
                                : 'navigation__list-item-link'
                        }
                    >
                        Leaderbord
                    </NavLink>
                </li>
                {isUserAuthenticated && !activeGame && (
                    <li className="navigation__list-item">
                        <button
                            className="navigation__list-item-link navigation__list-item-link--button"
                            onClick={playHandler}
                            disabled={isUserAlreadyInQueue}
                        >
                            Play
                        </button>
                    </li>
                )}
                {isUserAuthenticated && activeGame && (
                    <li className="navigation__list-item">
                        <button
                            className="navigation__list-item-link navigation__list-item-link--button"
                            onClick={playHandler}
                            disabled={location.pathname === ('/games/' + activeGame)}
                        >
                            Return to the game
                        </button>
                    </li>
                )}
            </ul>
            {!isUserAuthenticated && (
                <ul className="navigation__list">
                    <li className="navigation__list-item">
                        <NavLink
                            to="/signup"
                            className={
                                ({ isActive }) => isActive
                                    ? 'navigation__list-item-link navigation__list-item-link--outline navigation__list-item-link--outline-active'
                                    : 'navigation__list-item-link navigation__list-item-link--outline'
                            }
                        >
                            Sign up
                        </NavLink>
                    </li>
                    <li className="navigation__list-item">
                        <NavLink
                            to="login"
                            className={
                                ({ isActive }) => isActive
                                    ? 'navigation__list-item-link navigation__list-item-link--active'
                                    : 'navigation__list-item-link'
                            }
                        >
                            Log in
                        </NavLink>
                    </li>
                </ul>
            )}
            {isUserAuthenticated && <MiniProfile />}
        </nav>
    );
}

export default Navigation;
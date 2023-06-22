import { useSelector } from 'react-redux/es/hooks/useSelector';
import { Link, NavLink } from 'react-router-dom';

import './Navigation.scss';

const Navigation = () => {
    const user = useSelector(state => state.user);
    const isUserAuthenticated = user.username && user.email;

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
            {isUserAuthenticated && (
                <div>
                    <div>
                        <img src={`http://localhost:3000${user.avatar}`} alt={user.username} />
                    </div>
                    <div>
                        <Link to="/profile">
                            {user.username}
                        </Link>
                        <button>
                            Settings
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navigation;
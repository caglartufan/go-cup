import { Link } from 'react-router-dom';

import Navigation from '../Navigation/Navigation';

import './Header.scss';

const Header = () => {
    return (
        <header className="header">
            <Link to="/" className="header__brand">
                Go Cup
            </Link>
            <Navigation />
        </header>
    );
}

export default Header;
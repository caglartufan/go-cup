import { NavLink } from 'react-router-dom';

function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink
                        to="/"
                    >
                        Home
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
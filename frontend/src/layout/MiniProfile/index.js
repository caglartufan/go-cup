import { Form, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../utils/helpers';
import useDropdown from '../../hooks/useDropdown';

import Button from '../../components/UI/Button';

import './style.scss';

const MiniProfile = () => {
    const user = useSelector(state => state.user);
    const {
        showDropdown,
        dropdownRef,
        dropdownHandleRef
    } = useDropdown();

    return (
        <div className="mini-profile">
            <Link to="/profile/games" className="mini-profile__avatar-link">
                <img
                    src={BASE_URL + user.avatar}
                    className="mini-profile__avatar-image"
                    alt={user.username}
                />
            </Link>
            <div className="mini-profile__links">
                <Link to="/profile" className="mini-profile__link">
                    {user.username}
                </Link>
                <Button
                    className="mini-profile__link mini-profile__link--settings"
                    link
                    ref={dropdownHandleRef}
                >
                    Settings
                </Button>
            </div>
            {/* TODO: This dropdown can be out sourced into a separate component for future uses */}
            {showDropdown && (
                <div className="mini-profile__dropdown" ref={dropdownRef}>
                    <ul className="mini-profile__dropdown-list">
                        <li className="mini-profile__dropdown-list-item">
                            <Link to="/profile" className="mini-profile__dropdown-list-link">
                                Games
                            </Link>
                        </li>
                        <li className="mini-profile__dropdown-list-item">
                            <Link to="/profile/statistics" className="mini-profile__dropdown-list-link">
                                Statistics
                            </Link>
                        </li>
                        <li className="mini-profile__dropdown-list-item">
                            <Link to="/profile/profile-settings" className="mini-profile__dropdown-list-link">
                                Profile Settings
                            </Link>
                        </li>
                    </ul>
                    <hr className="mini-profile__dropdown-separator" />
                    <ul className="mini-profile__dropdown-list">
                        <li className="mini-profile__dropdown-list-item">
                            <Form action="/logout" method="post">
                                <Button type="submit" link>
                                    Logout
                                </Button>
                            </Form>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MiniProfile;
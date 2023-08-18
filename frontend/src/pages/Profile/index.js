import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import { authMiddleware, getAuthToken } from '../../utils/auth';
import { BASE_URL } from '../../utils/helpers';

import Container from '../../layout/Grid/Container';
import Card from '../../components/UI/Card';

import './style.scss';

const ProfilePage = () => {
    const profileData = useLoaderData();

    return (
        <Container>
            <Card className="profile">
                <div className="profile-upper">
                    <div className="profile-upper-avatar">
                        <img
                            src={BASE_URL + profileData.avatar}
                            alt={profileData.username}
                            className="profile-upper-avatar__image"
                        />
                    </div>
                    <div className="profile-upper-general-info">
                        <span className="profile-upper-general-info__username">
                            {profileData.username}
                        </span>
                        <span className="profile-upper-general-info__fullname">
                            {profileData.firstname && profileData.username
                                ? `${profileData.firstname} ${profileData.lastname}`
                                : 'Full name was not shared'
                            }
                        </span>
                        <span className="profile-upper-general-info__signed-up-at">
                            Joined {new Date(profileData.createdAt).toUTCString()}
                        </span>
                    </div>
                </div>
                <div className="profile-lower">
                    <div className="profile-lower-tabs">
                        <NavLink
                            className={({ isActive }) => `profile-lower-tabs__tab ${isActive && 'profile-lower-tabs__tab--active'}`}
                            to=""
                            end
                        >
                            Games
                        </NavLink>
                        <NavLink
                            className={({ isActive }) => `profile-lower-tabs__tab ${isActive && 'profile-lower-tabs__tab--active'}`}
                            to="statistics"
                        >
                            Statistics
                        </NavLink>
                        <NavLink
                            className={({ isActive }) => `profile-lower-tabs__tab ${isActive && 'profile-lower-tabs__tab--active'}`}
                            to="profile-settings"
                        >
                            Profile Settings
                        </NavLink>
                    </div>
                    <div className="profile-lower-tab-content">
                        <Outlet />
                    </div>
                </div>
            </Card>
        </Container>
    );
};

export const loader = async () => {
    const authMiddlewareResult = authMiddleware();

    if(authMiddlewareResult !== null) {
        return authMiddlewareResult;
    }

    const response = await fetch(BASE_URL + '/api/users/me', {
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        }
    });

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    return resData.user;
};

export default ProfilePage;
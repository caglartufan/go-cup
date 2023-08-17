import { useLoaderData } from 'react-router-dom';
import { authMiddleware, getAuthToken } from '../../utils/auth';

import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';
import Card from '../../components/UI/Card';

const ProfilePage = () => {
    const profileData = useLoaderData();

    return (
        <Container>
            <Row columns={2}>
                <Column size={4}>
                    <Card className="profile-sidebar">
                        <div className="profile-sidebar-info">
                            <div className="profile-sidebar-avatar">
                                <img src={`http://localhost:3000${profileData.avatar}`} alt={profileData.username} className="profile-sidebar-avatar__image" />
                            </div>
                            <span className="profile-sidebar-general-info__username">
                                {profileData.username}
                            </span>
                            <span className="profile-sidebar-general-info__full-name">
                                {profileData.firstName && profileData.lastName
                                    ? (profileData.firstName + ' ' + profileData.lastName)
                                    : 'Click pen icon to provide full name'}
                            </span>
                            {profileData.country && (
                                <div className="profile-sidebar-general-info__country">
                                    <img src="" alt="" className="profile-sidebar-general-info__country-image" />
                                    <span className="profile-sidebar-general-info__country-name">
                                        {}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="profile-sidebar-game-info">
                            <span className="profile-sidebar-game-info__total-games">
                                Total games played: 10
                            </span>
                            <span className="profile-sidebar-game-info__win-rate">
                                Win rate: 52%
                            </span>
                            <span className="profile-sidebar-game-info__first-game-at">
                                First game played at: 13 March 2023, 18:59
                            </span>
                            <span className="profile-sidebar-game-info__last-game-at">
                                Last game played at: 14 August 2023, 13:21
                            </span>
                        </div>
                    </Card>
                </Column>
                <Column size={8}>
                    <Card>
                        Details
                    </Card>
                </Column>
            </Row>
        </Container>
    );
};

export const loader = async () => {
    const authMiddlewareResult = authMiddleware();

    if(authMiddlewareResult !== null) {
        return authMiddlewareResult;
    }

    const response = await fetch('http://localhost:3000/api/users/me', {
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
import { useLoaderData } from 'react-router-dom';
import Row from '../layout/Grid/Row';
import Column from '../layout/Grid/Column';

const LeaderbordPage = () => {
    const leaderboard = useLoaderData();

    return (
        <Row>
            <Column>
                <h1>Leaderbord Page!</h1>
                {leaderboard?.length ? (
                    <table>
                        <thead>
                            <tr>
                                <td>
                                    Rank
                                </td>
                                <td>
                                    User
                                </td>
                                <td>
                                    ELO Rating
                                </td>
                                <td>
                                    Total Games Played
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map(
                                (user, index) => (
                                    <tr key={user.username}>
                                        <td>
                                            #{index + 1}
                                        </td>
                                        <td>
                                            <div>
                                                <div>
                                                    <img
                                                        src={`http://localhost:3000${user.avatar}`}
                                                        alt={user.username}
                                                    />
                                                </div>
                                                <div>
                                                    <span>
                                                        {user.username}
                                                    </span>
                                                    {
                                                        user.isOnline
                                                            ? <span>Online</span>
                                                            : <span>Offline</span>
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.elo}
                                        </td>
                                        <td>
                                            {user.totalGames}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                ) : (
                    // TODO: Add a refresh button
                    <p className="text-center">
                        Leaderboard data is no available
                    </p>
                )}
            </Column>
        </Row>
    );
};

export const loader = async () => {
    const response = await fetch('http://localhost:3000/api/users/leaderboard');

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    return resData.leaderboard;
};

export default LeaderbordPage;
import { NavLink, useLoaderData } from 'react-router-dom';

import Container from '../layout/Grid/Container';
import Row from '../layout/Grid/Row';
import Column from '../layout/Grid/Column';
import Table from '../components/UI/Table';

import './Leaderboard.scss';

const LeaderbordPage = () => {
    const leaderboard = useLoaderData();

    let content = (
        // TODO: Add a refresh button
        <p className="text-center">
            Leaderboard data is no available
        </p>
    );

    const tableColumns = {
        rank: 'Rank',
        user: 'User',
        elo: 'ELO Rating',
        'total-games': 'Total Games Played'
    };

    const tableRows = [];

    if(leaderboard?.length) {
        leaderboard.forEach(
            (user, index) => {
                const rowData = {};

                const rank = index + 1;

                rowData.id = `#${rank}-${user.username}`
                rowData.rank = (
                    <span className="leaderboard-rank">
                        #{rank}
                    </span>
                );
                rowData.user = (
                    <div className="leaderboard-user">
                        <div className="leaderboard-user-avatar">
                            <img
                                src={`http://localhost:3000${user.avatar}`}
                                alt={user.username}
                                className={`leaderboard-user-avatar__image leaderboard-user-avatar__image--${user.isOnline ? 'online' : 'offline'}`}
                            />
                        </div>
                        <div className="leaderboard-user-metadata">
                            <NavLink
                                className="leaderboard-user-metadata__username"
                                to={`/profile/${user.username}`}
                            >
                                {user.username}
                            </NavLink>
                            {
                                user.isOnline
                                    ? (
                                        <span
                                            className="leaderboard-user-metadata__activity leaderboard-user-metadata__activity--online"
                                        >
                                            Online
                                        </span>
                                    )
                                    : (
                                        <span
                                            className="leaderboard-user-metadata__activity leaderboard-user-metadata__activity--offline"
                                        >
                                            Offline
                                        </span>
                                    )
                            }
                        </div>
                    </div>
                );
                rowData.elo = user.elo;
                rowData['total-games'] = user.totalGames;

                tableRows.push(rowData);
            }
        );

        content = <Table columns={tableColumns} rows={tableRows} />;
    }

    return (
        <Container>
            <Row>
                <Column>
                    <h1 className="heading-primary">
                        Leaderbord Page!
                    </h1>
                    <h2 className="heading-secondary">
                        Players with highest ELO ratings are shown here
                    </h2>
                    {content}
                </Column>
            </Row>
        </Container>
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
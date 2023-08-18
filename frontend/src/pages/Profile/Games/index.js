import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { getAuthToken } from '../../../utils/auth';
import { BASE_URL } from '../../../utils/helpers';

import Table from '../../../components/UI/Table';

import './style.scss';

const GamesTab = props => {
    const username = useSelector(state => state.user.username);
    const gamesData = useLoaderData();

    const tableColumns = {
        result: {
            text: 'Game result',
            width: '30%'
        },
        size: 'Board size',
        players: {
            text: 'Players',
            width: '30%'
        },
        private: 'Private',
        finishedAt: 'Finished at'
    };

    const tableRows = gamesData?.length
        ? gamesData.map(
            game => {
                const modifiedGame = {};

                modifiedGame.result = game.status;

                if(game.status === 'black_won') {
                    if(username === game.black.user.username) {
                        modifiedGame.result = (
                            <span className="text-success font-weight-600">
                                You have won
                            </span>
                        );
                    } else {
                        modifiedGame.result = (
                            <span className="text-danger font-weight-600">
                                You have lost
                            </span>
                        );
                    }
                }
                
                if(game.status === 'white_won') {
                    if(username === game.white.user.username) {
                        modifiedGame.result = (
                            <span className="text-success font-weight-600">
                                You have won
                            </span>
                        );
                    } else {
                        modifiedGame.result = (
                            <span className="text-danger font-weight-600">
                                You have lost
                            </span>
                        );
                    }
                }

                if(game.status === 'black_resigned') {
                    if(username === game.black.user.username) {
                        modifiedGame.result = (
                            <span className="text-danger font-weight-600">
                                You have resigned
                            </span>
                        );
                    } else {
                        modifiedGame.result = (
                            <span className="text-success font-weight-600">
                                Opponent resigned
                            </span>
                        );
                    }
                }

                if(game.status === 'white_resigned') {
                    if(username === game.white.user.username) {
                        modifiedGame.result = (
                            <span className="text-danger font-weight-600">
                                You have resigned
                            </span>
                        );
                    } else {
                        modifiedGame.result = (
                            <span className="text-success font-weight-600">
                                Opponent resigned
                            </span>
                        );
                    }
                }

                if(game.status === 'cancelled') {
                    modifiedGame.result = (
                        <span className="font-weight-600">
                            Game cancelled
                        </span>
                    );
                }

                if(game.status === 'cancelled_by_black') {
                    modifiedGame.result = (
                        <span className="font-weight-600">
                            Cancelled by black
                        </span>
                    );
                }

                if(game.status === 'cancelled_by_white') {
                    modifiedGame.result = (
                        <span className="font-weight-600">
                            Cancelled by white
                        </span>
                    );
                }

                modifiedGame.size = (
                    <span className="font-weight-600">
                        {game.size}x{game.size}
                    </span>
                );
                modifiedGame.players = (
                    <span>
                        <span className="text-bg-black">
                            {game.black.user.username}
                        </span> vs. <span className="text-bg-white">
                            {game.white.user.username}
                        </span>
                    </span>
                );
                modifiedGame.private = game.isPrivate ? 'Yes' : 'No';
                modifiedGame.finishedAt = new Date(game.finishedAt).toLocaleString();

                return modifiedGame;
            }
        )
        : [{
            id: 'no-data'
        }];

    return (
        <Table
            columns={tableColumns}
            rows={tableRows}
        />
    );
};

export const loader = async () => {
    const response = await fetch(BASE_URL + '/api/users/me/games', {
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        }
    });

    if(!response.ok) {
        return response;
    }

    const resData = await response.json();

    console.log(resData.games);

    return resData.games;
};

export default GamesTab;
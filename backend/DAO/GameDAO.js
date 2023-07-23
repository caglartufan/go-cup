const { Game } = require('../models/Game');
const { GameNotFoundError } = require('../utils/ErrorHandler');
const { firstLetterToUppercase } = require('../utils/helpers');
const MESSAGES = require('../messages/messages');
const { game } = require('../messages/validation');

class GameDAO {
    static async getGames() {
        // TODO: Filter unnecessary data requested such as chat, waitingEndsAt etc.
        return await Game
            .find({ isPrivate: false })
            .populate('black.user', '-_id username elo')
            .populate('white.user', '-_id username elo');
    }

    static async findGameById(gameId) {
        return await Game
            .findOne({
                _id: gameId,
                isPrivate: false
            })
            .populate('black.user', '-_id username elo avatar isOnline')
            .populate('white.user', '-_id username elo avatar isOnline')
            .populate('chat.user', '-_id username elo');
    }

    static async cancelGamesThatAreTimedOutOnWaitingStatusAndReturnGameIdsAndUserIds() {
        const processDate = new Date();

        const gamesToBeCancelledWithIdsAndPlayers = await Game
            .find({
                status: 'waiting',
                waitingEndsAt: { $lte: processDate }
            })
            .select('_id black.user white.user')
            .populate('black.user', '-_id username')
            .populate('white.user', '-_id username');

        const gameIds = [];
        const users = [];
        
        gamesToBeCancelledWithIdsAndPlayers.forEach(game => {
            gameIds.push(game._id);
            users.push(game.black.user, game.white.user);
        });

        if(gameIds.length) {
            await Game.updateMany({
                _id: { $in: gameIds }
            }, {
                status: 'cancelled',
                $push: {
                    chat: {
                        message: MESSAGES.DAO.GameDAO.GAME_CANCELLED,
                        isSystem: true,
                        createdAt: processDate
                    }
                },
                finishedAt: processDate
            });
        }

        return { gameIds, users };
    }

    static async finishGamesThatPlayerRanOutOfTimeAndReturnGameIdsAndUserIds() {
        const processDate = new Date();

        const gamesToBeFinishedWithIdsAndPlayers = await Game.aggregate([
            {
                /**
                 * Filters games that are "started"
                 */
                $match: {
                    status: 'started'
                }
            },
            {
                /**
                 * Only include _id, moves, black, white and startedAt fields
                 */
                $project: {
                    _id: 1,
                    moves: 1,
                    black: 1,
                    white: 1,
                    chat: 1,
                    startedAt: 1
                }
            },
            {
                /**
                 * Join black.user with associated user from users collection
                 */
                $lookup: {
                    from: 'users',
                    let: { userId: '$black.user' },
                    pipeline: [
                        { $match: { $expr: { $eq: [ '$_id', '$$userId' ] } } },
                        { $project: { _id: 0, username: 1 } }
                    ],
                    as: 'black.user'
                }
            },
            {
                /**
                 * Join white.user with associated user from users collection
                 */
                $lookup: {
                    from: 'users',
                    let: { userId: '$white.user' },
                    pipeline: [
                        { $match: { $expr: { $eq: [ '$_id', '$$userId' ] } } },
                        { $project: { _id: 0, username: 1 } }
                    ],
                    as: 'white.user'
                }
            },
            {
                /**
                 * Replace white.user and black.user fields with join result's first and only element.
                 * Add "lastMoveAt" date and "whosTurn" (turn player's color) fields
                 */
                $addFields: {
                    'white.user': { $arrayElemAt: ['$white.user', 0] },
                    'black.user': { $arrayElemAt: ['$black.user', 0] },
                    lastMoveAt: {
                        $ifNull: [
                            { $last: "$moves.createdAt" },
                            "$startedAt"
                        ]
                    },
                    whosTurn: {
                        $cond: {
                            if: {
                                $eq: [
                                    { $last: "$moves.player" },
                                    "black"
                                ]
                            },
                            then: "white",
                            else: "black",
                        }
                    }
                }
            },
            {
                /**
                 * Add "isPlayerRanOutOfTime" (boolean) field  which is calculated by comparing elapsed time
                 * since last move (dateDifferenceBetweenNowAndLastMove) and turn player's remaning time.
                 * If turn player's reamining time less than the time elapsed since last move, then the player
                 * is ran out of time and game should be finished with status indicating the oppenent of
                 * turn player has won.
                 */
                $addFields: {
                    isPlayerRanOutOfTime: {
                        $let: {
                            vars: {
                                playerTimeRemaining: {
                                    $cond: {
                                        if: {
                                            $eq: ["$whosTurn", "black"]
                                        },
                                        then: "$black.timeRemaining",
                                        else: "$white.timeRemaining"
                                    }
                                },
                                dateDifferenceBetweenNowAndLastMove: {
                                    $dateDiff: {
                                        startDate: "$lastMoveAt",
                                        endDate: processDate,
                                        unit: "second"
                                    }
                                }
                            },
                            in: {
                                $gte: [
                                    "$$dateDifferenceBetweenNowAndLastMove",
                                    "$$playerTimeRemaining",
                                ]
                            }
                        }
                    }
                }
            }, {
                /**
                 * Filter games that turn player has ran out of time
                 */
                $match: {
                    isPlayerRanOutOfTime: true
                }
            }
        ]);

        const gameIds = [];
        const users = [];

        gamesToBeFinishedWithIdsAndPlayers.forEach(game => {
            gameIds.push(game._id);
            users.push(game.black.user, game.white.user);
        });

        // To update many object in one go to MongoDB server.
        // Used bulkWrite instead of updateMany to update fields conditionally
        await Game.bulkWrite([
            {
                updateMany: {
                    filter: {
                        _id: { $in: gameIds }
                    },
                    update: [
                        {
                            $addFields: {
                                whosTurn: {
                                    $cond: {
                                        if: {
                                            $eq: [
                                                { $last: "$moves.player" },
                                                "black"
                                            ]
                                        },
                                        then: "white",
                                        else: "black",
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                status: {
                                    $cond: {
                                        if: { $eq: ['$whosTurn', 'black'] },
                                        then: 'white_won',
                                        else: 'black_won'
                                    }
                                },
                                'black.timeRemaining': {
                                    $cond: {
                                        if: { $eq: ['$whosTurn', 'black'] },
                                        then: 0,
                                        else: '$black.timeRemaining'
                                    }
                                },
                                'white.timeRemaining': {
                                    $cond: {
                                        if: { $eq: ['$whosTurn', 'white'] },
                                        then: 0,
                                        else: '$white.timeRemaining'
                                    }
                                },
                                chat: {
                                    $concatArrays: [
                                        '$chat',
                                        [{
                                            message: {
                                                $cond: {
                                                    if: { $eq: ['$whosTurn', 'black'] },
                                                    then: MESSAGES.DAO.GameDAO.WHITE_WON,
                                                    else: MESSAGES.DAO.GameDAO.BLACK_WON
                                                }
                                            },
                                            isSystem: true,
                                            createdAt: processDate
                                        }]
                                    ]
                                },
                                finishedAt: processDate
                            }
                        },
                        {
                            $project: {
                                whosTurn: 0
                            }
                        }
                    ]
                }
            }
        ]);

        return { gameIds, users };
    }

    static async updateGamesThatHaveTimedOutUndoRequestAndReturnGames() {
        const processDate = new Date();

        const games = await Game
            .find({
                status: 'started',
                'undo.requestEndsAt': {
                    $lte: processDate
                }
            })
            .select('_id undo');

        const gameIds = games.map(game => game._id);
        const result = games.map(
            game => ({ _id: game._id, requestedBy: game.undo.requestedBy })
        );

        await Game.bulkWrite([
            {
                updateMany: {
                    filter: {
                        _id: { $in: gameIds }
                    },
                    update: [
                        {
                            $addFields: {
                                undo: {
                                    requestedBy: null,
                                    requestedAt: null,
                                    requestEndsAt: null
                                }
                            }
                        }
                    ]
                }
            }
        ])

        return result;
    }

    static async cancelGame(gameId, cancelledBy) {
        const game = await this.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        game.status = 'cancelled_by_' + cancelledBy;
        game.chat.push({
            message: MESSAGES.DAO.GameDAO.GAME_CANCELLED_BY.replace('#{CANCELLED_BY}', cancelledBy),
            isSystem: true
        });
        game.finishedAt = new Date();

        await game.save();

        return { _id: game._id, latestSystemChatEntry: game.chat.filter(chatEntry => chatEntry.isSystem === true).pop() }
    }

    static async resignFromGame(gameId, resignedPlayer) {
        const game = await this.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        game.status = resignedPlayer + '_resigned';
        game.chat.push({
            message: MESSAGES.DAO.GameDAO.PLAYER_RESIGNED_FROM_GAME.replace('#{RESIGNED_PLAYER}', firstLetterToUppercase(resignedPlayer)),
            isSystem: true
        });
        game.finishedAt = new Date();

        await game.save();

        return { _id: game._id, latestSystemChatEntry: game.chat.filter(chatEntry => chatEntry.isSystem === true).pop() }
    }

    static async getGamesWithLatestSystemChatEntryByGameIds(gameIds) {
        return await Game.aggregate([
            {
                $match: {
                    _id: { $in: gameIds }
                }
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    black: {
                        score: '$black.score',
                        timeRemaining: '$black.timeRemaining'
                    },
                    white: {
                        score: '$white.score',
                        timeRemaining: '$white.timeRemaining'
                    },
                    chat: 1
                }
            },
            {
                $addFields: {
                    latestSystemChatEntry: {
                        $let: {
                            vars: {
                                systemChatEntries: {
                                    $filter: {
                                        input: '$chat',
                                        cond: { $eq: ['$$this.isSystem', true] }
                                    }
                                }
                            },
                            in: {
                                $last: '$$systemChatEntries'
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    latestSystemChatEntry: { $not: { $eq: null } }
                }
            },
            {
                $project: {
                    chat: 0
                }
            }
        ]);
    }

    static async createGame(blackUserId, whiteUserId) {
        const game = new Game({
            size: 9,
            black: {
                user: blackUserId
            },
            white: {
                user: whiteUserId
            }
        });

        return await game.save();
    }
}

module.exports = GameDAO;
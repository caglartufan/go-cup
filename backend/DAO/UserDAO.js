const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const { UserNotFoundError } = require('../utils/ErrorHandler');

class UserDAO {
    static async findByUsername(username) {
        return await User.findOne({
            username
        });
    }

    static async findByEmail(email) {
        return await User.findOne({
            email
        });
    }

    static async findUsersByUsernameAndEmail(username, email) {
        return await User.find({
            $or: [
                { username },
                { email }
            ]
        }).select('-_id username email');
    }

    static async findByUsernameOrEmail(login) {
        return await User.findOne({
            $or: [
                { username: login },
                { email: login }
            ]
        });
    }

    static async getUserIdByUsernameAndEmail(username, email) {
        return await User.findOne({
            username,
            email
        }).distinct('_id');
    }

    static async getUserIdsByUsernames(...usernames) {
        return await User.find({
            username: {
                $in: usernames
            }
        }).select('username');
    }

    static async getGamesOfUser(user, populate = false) {

        if(populate) {
            user = await User
                .aggregate([
                    {
                        $match: {
                            username: user.username,
                            email: user.email
                        }
                    },
                    {
                        $project: {
                            games: 1
                        }
                    },
                    {
                        $lookup: {
                            from: 'games',
                            localField: 'games',
                            foreignField: '_id',
                            as: 'games',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        size: 1,
                                        status: 1,
                                        'black.user': 1,
                                        'white.user': 1,
                                        isPrivate: 1,
                                        startedAt: 1,
                                        finishedAt: 1
                                    }
                                },
                                {
                                    $match: {
                                        status: {
                                            $in: ['black_won', 'white_won', 'white_resigned', 'black_resigned', 'cancelled', 'cancelled_by_black', 'cancelled_by_white']
                                        },
                                        isPrivate: false
                                    }
                                },
                                {
                                    $sort: {
                                        finishedAt: -1
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'black.user',
                                        foreignField: '_id',
                                        as: 'black.user',
                                        pipeline: [
                                            {
                                                $project: {
                                                    _id: 0,
                                                    username: 1
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'white.user',
                                        foreignField: '_id',
                                        as: 'white.user',
                                        pipeline: [
                                            {
                                                $project: {
                                                    _id: 0,
                                                    username: 1
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $addFields: {
                                        'black.user': {
                                            $arrayElemAt: ['$black.user', 0]
                                        },
                                        'white.user': {
                                            $arrayElemAt: ['$white.user', 0]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]);
        } else {
            user = await User
                .findOne({
                    username: user.username,
                    email: user.email
                })
                .select('games');
        }

        if(!user) {
            throw new UserNotFoundError();
        }

        if(user?.length) {
            user = user[0];
        }

        return user.games;
    }

    static async getTopEloPlayers(total = 20) {
        return await User
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        username: 1,
                        avatar: 1,
                        isOnline: 1,
                        elo: 1,
                        totalGames: { $size: '$games' }
                    }
                },
                {
                    $sort: {
                        elo: -1
                    }
                },
                {
                    $limit: total
                }
            ])
            .exec();
    }

    static async createUser(user) {
        user = new User({
            username: user.username,
            email: user.email,
            password: user.password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        return await user.save();
    }

    static async setUserOnline(user) {
        await User.findOneAndUpdate({
            username: user.username,
            email: user.email
        }, {
            isOnline: true
        });
    }

    static async setUserOffline(user) {
        await User.findOneAndUpdate({
            username: user.username,
            email: user.email
        }, {
            isOnline: false
        });
    }

    static async nullifyActiveGameOfUsers(...users) {
        await User.updateMany({
            username: { $in: users.map(user => user.username) }
        }, {
            activeGame: null
        });
    }
}

module.exports = UserDAO;
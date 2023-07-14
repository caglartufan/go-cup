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
        }).distinct('_id');
    }

    static async getGamesOfUser(user) {
        user = await User.findOne({
            username: user.username,
            email: user.email
        }).select('games');

        if(!user) {
            throw new UserNotFoundError();
        }

        return user.games;
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
}

module.exports = UserDAO;
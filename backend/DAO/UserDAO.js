const bcrypt = require('bcrypt');
const { User } = require('../models/User');

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
        return  await User.find({
            username: {
                $in: usernames
            }
        }).distinct('_id');
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
}

module.exports = UserDAO;
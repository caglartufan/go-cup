const bcrypt = require('bcrypt');
const { User } = require('../models/user');

class UserDAO {
    static async findAlreadyExistingUser(username, email) {
        return await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
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
const jwt = require('jsonwebtoken');
const config = require('config');
const UserDAO = require('../DAO/UserDAO');
const { UserNotFoundError, ErrorHandler } = require('../utils/ErrorHandler');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
	var token = null;
	
	if(authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7, authHeader.length);
	}

	try {
		const { username } = jwt.verify(token, config.get('jwt.privateKey'));

        const user = await UserDAO.findByUsername(username);

        if(!user) {
            next(new UserNotFoundError());
        }

        req.user = user;

		next();
	} catch(error) {
		next(ErrorHandler.handle(error));
	}
};

module.exports = auth;
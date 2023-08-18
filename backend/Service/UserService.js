const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const UserDTO = require('../DTO/UserDTO');
const UserDAO = require('../DAO/UserDAO');
const {
    InvalidDTOError,
    UserValidationError,
    InvalidUserCredentialsError,
    UnauthorizedError
} = require('../utils/ErrorHandler');
const Validator = require('../utils/Validator');

class UserService {
    async signupUser(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        const { error } = Validator.validateSignupData(user);

        if(error) {
            throw UserValidationError.fromJoiError(error);
        }

        const alreadyExistingUsers = await UserDAO.findUsersByUsernameAndEmail(user.username, user.email);

        if(alreadyExistingUsers.length) {
            const alreadyUsedUsernames = alreadyExistingUsers.map(existingUser => existingUser.username);
            const alreadyUsedEmails = alreadyExistingUsers.map(existingUser => existingUser.email);
            const isDuplicateUsername = alreadyUsedUsernames.includes(user.username);
            const isDuplicateEmail = alreadyUsedEmails.includes(user.email);
            
            throw UserValidationError.fromDuplicateUsernameOrEmail(isDuplicateUsername, isDuplicateEmail);
        }

        user = await UserDAO.createUser(user);

        return user;
    }

    async loginUser(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        const { error } = Validator.validateLoginData(user);

        if(error) {
            throw UserValidationError.fromJoiError(error);
        }

        const loginUser = await UserDAO.findByUsernameOrEmail(user.login);

        if(!loginUser) {
            throw new InvalidUserCredentialsError();
        }

        const isEnteredPasswordValid = await bcrypt.compare(user.password, loginUser.password);
        if(!isEnteredPasswordValid) {
            throw new InvalidUserCredentialsError();
        }

        return loginUser;
    }

    async authenticate(token) {
        if(!token) {
            throw new UnauthorizedError();
        }
        
        const { username } = jwt.verify(token, config.get('jwt.privateKey'));

        const user = await UserDAO.findByUsername(username);

        if(!user) {
            throw new UserNotFoundError();
        }

        const userDTO = UserDTO.withUserObject(user);

        return userDTO;
    }

    async getUserIdByUser(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        const userId = await UserDAO.getUserIdByUsernameAndEmail(user.username, user.email);

        return userId;
    }

    async getGamesOfUser(user, populate = false) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        return await UserDAO.getGamesOfUser(user, populate);
    }

    async setUserOnline(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        await UserDAO.setUserOnline(user);
    }

    async setUserOffline(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        await UserDAO.setUserOffline(user);
    }
}

module.exports = UserService;
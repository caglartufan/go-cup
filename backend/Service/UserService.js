const bcrypt = require('bcrypt');
const UserDTO = require('../DTO/UserDTO');
const UserDAO = require('../DAO/UserDAO');
const {
    InvalidDTOError,
    UserValidationError,
    InvalidUserCredentialsError
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
}

module.exports = UserService;
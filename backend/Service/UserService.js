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

        const alreadyExistingUser = await UserDAO.findAlreadyExistingUser(user.username, user.email);

        if(alreadyExistingUser) {
            const isDuplicateUsername = alreadyExistingUser.username === user.username;
            const isDuplicateEmail = alreadyExistingUser.email === user.email;
            
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

        const loginUser = await UserDAO.findAlreadyExistingUser(user.login, user.login);

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
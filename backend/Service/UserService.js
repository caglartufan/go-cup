const Joi = require('joi');
const bcrypt = require('bcrypt');
const UserDTO = require('../DTO/UserDTO');
const UserDAO = require('../DAO/UserDAO');
const {
    ErrorHandler,
    InvalidDTOError,
    UserValidationError,
    InvalidUserCredentialsError
} = require('../utils/ErrorHandler');

class UserService {
    async signupUser(user) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        const { error } = this.#validateSignupData(user);

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

        const { error } = this.#validateLoginData(user);

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

    #validateSignupData(user) {
        const schema = Joi.object({
            'username': Joi.string().min(3).max(30).alphanum().required().messages({
                'string.empty': `User name is required.`,
                'string.min': `User name must have at least {#limit} characters.`,
                'string.max': `User name must have less than {#limit} characters.`,
                'string.alphanum': `Username must be alphanumeric.`,
                'any.required': `Username is required.`
            }),
            'email': Joi.string().email().required().messages({
                'string.empty': `E-mail address is required.`,
                'string.email': `E-mail address is not valid.`,
                'any.required': `E-mail address is required.`
            }),
            'password': Joi.string().min(4).max(1024).required().messages({
                'string.empty': `Password is required.`,
                'string.min': `Password must have at least {#limit} characters.`,
                'string.max': `Password must have less than {#limit} characters.`,
                'any.required': `Password is required.`
            }),
            'password-confirmation': Joi.any().valid(Joi.ref('password')).required().messages({
                'any.required': `Password confirmation is required.`,
                'any.only': `Password and password confirmation does not match.`
            })
        });
    
        return schema.validate({
            'username': user.username,
            'email': user.email,
            'password': user.password,
            'password-confirmation': user.passwordConfirmation
        }, { abortEarly: false });
    }

    #validateLoginData(user) {
        const schema = Joi.object({
            'login': Joi.alternatives().required().try(
                Joi.string().min(3).max(30).alphanum(),
                Joi.string().email()
            ).messages({
                'alternatives.match': `Please enter a valid user name or e-mail address.`,
                'any.required': `User name or e-mail address is required.`,
            }),
            'password': Joi.string().min(4).required().max(1024).messages({
                'string.empty': `Password is required.`,
                'string.min': `Password must have at least {#limit} characters.`,
                'string.max': `Password must have less than {#limit} characters.`,
                'any.required': `Password is required.`
            })
        });
    
        return schema.validate({
            login: user.login,
            password: user.password
        }, { abortEarly: false });
    }
}

module.exports = UserService;
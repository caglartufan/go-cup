const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const {
    USERNAME_REGEX,
    EMAIL_REGEX,
    COUNTRY_REGEX,
    NAME_REGEX
} = require('../helpers/validation');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'User name is required.'],
        minlength: [3, 'User name must have at least {MINLENGTH} characters.'],
        maxlength: [30, 'User name must have less than {MAXLENGTH} characters.'],
        match: [USERNAME_REGEX, 'User name must contain minimum 3 and maximum 30 alphanumeric characters.'],
        unique: true,
    },
    firstname: {
        type: String,
        minlength: [2, 'First name must have at least {MINLENGTH} characters.'],
        maxlength: [100, 'First name must have less than {MAXLENGTH} characters.'],
        match: [NAME_REGEX, 'First name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.']
    },
    lastname: {
        type: String,
        minlength: [2, 'Last name must have at least {MINLENGTH} characters.'],
        maxlength: [100, 'Last name must have less than {MAXLENGTH} characters.'],
        match: [NAME_REGEX, 'Last name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.']
    },
    email: {
        type: String,
        required: [true, 'E-mail address is required.'],
        match: [EMAIL_REGEX, 'E-mail address is not valid.'],
        unique: true
    },
    // TODO: Enable password strength validation, throw error for weak passwords and enforce usage of special characters in password (modify the auth routes and validation helper functions)
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: [4, 'Password must have at least {MINLENGTH} characters.'],
        maxlength: [1024, 'Password must have less than {MAXLENGTH} characters.']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    country: {
        type: String,
        match: [COUNTRY_REGEX, 'Country must be a valid country code containing 2 uppercase letters.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        config.get('jwt.privateKey'),
        {
            expiresIn: '1d'
        }
    );

    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        'username': Joi.string().min(3).max(30).alphanum().required().messages({
            'string.empty': `User name is required.`,
            'string.min': `User name must have at least {#limit} characters.`,
            'string.max': `User name must have less than {#limit} characters.`,
            'string.alphanum': `Username must be alphanumeric.`,
            'any.required': `Username is required.`
        }),
        'firstname': Joi.string().min(2).max(100).regex(NAME_REGEX).messages({
            'string.min': `First name must have at least {#limit} characters.`,
            'string.max': `First name must have less than {#limit} characters.`,
            'string.pattern.base': `First name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.`
        }),
        'lastname': Joi.string().min(2).max(100).regex(NAME_REGEX).messages({
            'string.min': `Last name must have at least {#limit} characters.`,
            'string.max': `Last name must have less than {#limit} characters.`,
            'string.pattern.base': `Last name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.`
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
        'isAdmin': Joi.boolean().default(false).messages({
            'boolean.base': `isAdmin field must be a valid boolean value.`
        }),
        // TODO: Add whitelist validation with .allow method
        'country': Joi.string().regex(COUNTRY_REGEX).messages({
            'string.pattern.base': `Country must be a valid country code containing 2 uppercase letters.`
        })
    });

    return schema.validate(user, { abortEarly: false });
}

exports.User = User;
exports.validateUser = validateUser;
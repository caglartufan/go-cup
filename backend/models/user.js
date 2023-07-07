const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const Validator = require('../utils/Validator');
const VALIDATION = require('../messages/validation');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, VALIDATION.user.username['any.required']],
        minlength: [3, VALIDATION.user.username['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [30, VALIDATION.user.username['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.USERNAME_REGEX, VALIDATION.user.username['string.pattern.base']],
        unique: true,
    },
    avatar: {
        type: String,
        match: [Validator.AVATAR_REGEX, VALIDATION.user.avatar['string.pattern.base']],
        default: '/images/avatar_placeholder.png'
    },
    firstname: {
        type: String,
        minlength: [2, VALIDATION.user.firstname['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [100, VALIDATION.user.firstname['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.NAME_REGEX, VALIDATION.user.firstname['string.pattern.base']]
    },
    lastname: {
        type: String,
        minlength: [2, VALIDATION.user.lastname['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [100, VALIDATION.user.lastname['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.NAME_REGEX, VALIDATION.user.lastname['string.pattern.base']]
    },
    email: {
        type: String,
        required: [true, VALIDATION.user.email['any.required']],
        match: [Validator.EMAIL_REGEX, VALIDATION.user.email['string.email']],
        unique: true
    },
    // TODO: Enable password strength validation, throw error for weak passwords and enforce usage of special characters in password (modify the auth routes and validation helper functions)
    password: {
        type: String,
        required: [true, VALIDATION.user.password['any.required']],
        minlength: [4, VALIDATION.user.password['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [1024, VALIDATION.user.password['string.max'].replace('{#limit}', '{MAXLENGTH}')]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    country: {
        type: String,
        match: [Validator.COUNTRY_REGEX, VALIDATION.user.country['string.pattern.base']]
    },
    games: [{
        type: mongoose.SchemaTypes.ObjectId
    }],
    elo: {
        type: Number,
        default: 0
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
            username: this.username
        },
        config.get('jwt.privateKey'),
        {
            expiresIn: '1h'
        }
    );

    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        'username': Joi.string().min(3).max(30).alphanum().required().messages({
            'string.empty': VALIDATION.user.username['string.empty'],
            'string.min': VALIDATION.user.username['string.min'],
            'string.max': VALIDATION.user.username['string.max'],
            'string.alphanum': VALIDATION.user.username['string.alphanum'],
            'any.required': VALIDATION.user.username['any.required']
        }),
        'avatar': Joi.string().regex(Validator.AVATAR_REGEX).messages({
            'string.pattern.base': VALIDATION.user.avatar['string.pattern.base']
        }),
        'firstname': Joi.string().min(2).max(100).regex(Validator.NAME_REGEX).messages({
            'string.min': VALIDATION.user.firstname['string.min'],
            'string.max': VALIDATION.user.firstname['string.max'],
            'string.pattern.base': VALIDATION.user.firstname['string.pattern.base']
        }),
        'lastname': Joi.string().min(2).max(100).regex(Validator.NAME_REGEX).messages({
            'string.min': VALIDATION.user.lastname['string.min'],
            'string.max': VALIDATION.user.lastname['string.max'],
            'string.pattern.base': VALIDATION.user.lastname['string.pattern.base']
        }),
        'email': Joi.string().email().required().messages({
            'string.empty': VALIDATION.user.email['string.empty'],
            'string.email': VALIDATION.user.email['string.email'],
            'any.required': VALIDATION.user.email['any.required']
        }),
        'password': Joi.string().min(4).max(1024).required().messages({
            'string.empty': VALIDATION.user.password['string.empty'],
            'string.min': VALIDATION.user.password['string.min'],
            'string.max': VALIDATION.user.password['string.max'],
            'any.required': VALIDATION.user.password['any.required']
        }),
        'isAdmin': Joi.boolean().default(false).messages({
            'boolean.base': VALIDATION.user.isAdmin['boolean.base']
        }),
        // TODO: Add whitelist validation with .allow method
        'country': Joi.string().regex(Validator.COUNTRY_REGEX).messages({
            'string.pattern.base': VALIDATION.user.country['string.pattern.base']
        })
    });

    return schema.validate(user, { abortEarly: false });
}

exports.User = User;
exports.validateUser = validateUser;
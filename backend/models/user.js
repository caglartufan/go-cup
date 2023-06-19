const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const Validator = require('../utils/Validator');
const VALIDATION = require('../messages/validation');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, VALIDATION.username['any.required']],
        minlength: [3, VALIDATION.username['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [30, VALIDATION.username['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.USERNAME_REGEX, VALIDATION.username['string.pattern.base']],
        unique: true,
    },
    firstname: {
        type: String,
        minlength: [2, VALIDATION.firstname['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [100, VALIDATION.firstname['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.NAME_REGEX, VALIDATION.firstname['string.pattern.base']]
    },
    lastname: {
        type: String,
        minlength: [2, VALIDATION.lastname['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [100, VALIDATION.lastname['string.max'].replace('{#limit}', '{MAXLENGTH}')],
        match: [Validator.NAME_REGEX, VALIDATION.lastname['string.pattern.base']]
    },
    email: {
        type: String,
        required: [true, VALIDATION.email['any.required']],
        match: [Validator.EMAIL_REGEX, VALIDATION.email['string.email']],
        unique: true
    },
    // TODO: Enable password strength validation, throw error for weak passwords and enforce usage of special characters in password (modify the auth routes and validation helper functions)
    password: {
        type: String,
        required: [true, VALIDATION.password['any.required']],
        minlength: [4, VALIDATION.password['string.min'].replace('{#limit}', '{MINLENGTH}')],
        maxlength: [1024, VALIDATION.password['string.max'].replace('{#limit}', '{MAXLENGTH}')]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    country: {
        type: String,
        match: [Validator.COUNTRY_REGEX, VALIDATION.country['string.pattern.base']]
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
            'string.empty': VALIDATION.username['string.empty'],
            'string.min': VALIDATION.username['string.min'],
            'string.max': VALIDATION.username['string.max'],
            'string.alphanum': VALIDATION.username['string.alphanum'],
            'any.required': VALIDATION.username['any.required']
        }),
        'firstname': Joi.string().min(2).max(100).regex(Validator.NAME_REGEX).messages({
            'string.min': VALIDATION.firstname['string.min'],
            'string.max': VALIDATION.firstname['string.max'],
            'string.pattern.base': VALIDATION.firstname['string.pattern.base']
        }),
        'lastname': Joi.string().min(2).max(100).regex(Validator.NAME_REGEX).messages({
            'string.min': VALIDATION.lastname['string.min'],
            'string.max': VALIDATION.lastname['string.max'],
            'string.pattern.base': VALIDATION.lastname['string.pattern.base']
        }),
        'email': Joi.string().email().required().messages({
            'string.empty': VALIDATION.email['string.empty'],
            'string.email': VALIDATION.email['string.email'],
            'any.required': VALIDATION.email['any.required']
        }),
        'password': Joi.string().min(4).max(1024).required().messages({
            'string.empty': VALIDATION.password['string.empty'],
            'string.min': VALIDATION.password['string.min'],
            'string.max': VALIDATION.password['string.max'],
            'any.required': VALIDATION.password['any.required']
        }),
        'isAdmin': Joi.boolean().default(false).messages({
            'boolean.base': VALIDATION.isAdmin['boolean.base']
        }),
        // TODO: Add whitelist validation with .allow method
        'country': Joi.string().regex(Validator.COUNTRY_REGEX).messages({
            'string.pattern.base': VALIDATION.country['string.pattern.base']
        })
    });

    return schema.validate(user, { abortEarly: false });
}

exports.User = User;
exports.validateUser = validateUser;
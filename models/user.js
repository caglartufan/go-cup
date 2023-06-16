const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const {
    validateUsername,
    validateEmailAddress,
    validateCountry
} = require('../helpers/utils');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
        validate: {
            validator: validateUsername,
            message: 'User name must containing minimum 3 and maximum 30 alphanumeric characters.'
        },
        unique: true
    },
    firstname: {
        type: String,
        minlength: 2,
        maxlength: 100
    },
    lastname: {
        type: String,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: validateEmailAddress,
            message: 'E-mail address is not valid.'

        },
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    country: {
        type: String,
        validate: {
            validator: validateCountry,
            message: 'Country is not valid.'
        }
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

function validate(user) {
    const schema = Joi.object({
        'username': Joi.string().min(3).max(30).alphanum().required().messages({
            'string.empty': `User name is required.`,
            'string.min': `User name must have at least {#limit} characters.`,
            'string.max': `User name must have less than {#limit} characters.`,
            'string.alphanum': `Username must be alphanumeric.`,
            'any.required': `Username is required.`
        }),
        'firstname': Joi.string().min(2).max(100).regex(/^[A-z ,.'-]+$/).messages({
            'string.min': `First name must have at least {#limit} characters.`,
            'string.max': `First name must have less than {#limit} characters.`,
            'string.pattern.base': `First name can only contain Latin letters.`
        }),
        'lastname': Joi.string().min(2).max(100).regex(/^[A-z ,.'-]+$/).messages({
            'string.min': `Last name must have at least {#limit} characters.`,
            'string.max': `Last name must have less than {#limit} characters.`,
            'string.pattern.base': `Last name can only contain Latin letters.`
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
        'country': Joi.string().regex(/^[A-Z]{2}$/).messages({
            'string.pattern.base': `Country must be a valid country code containing 2 uppercase letters.`
        })
    });

    return schema.validate(user);
}

exports.User = User;
exports.validate = validate;
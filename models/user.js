const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
        validate: {
            validator: function(v) {
                return /^[A-z0-9]+$/.test(v);
            },
            message: 'Username must be alphanumeric.'
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
            validator: function(v) {
                return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v);
            },
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
    joinDate: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, config.get('jwt.privateKey'));
    return token;
};

const User = new mongoose.Model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        'username': Joi.string().min(3).max(30).alphanum().required().messages({
            'string.empty': `Username is required.`,
            'string.min': `Username must have at least {#limit} characters.`,
            'string.max': `Username must have less than {#limit} characters.`,
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
        })
    });

    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
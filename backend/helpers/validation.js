const Joi = require('joi');

const USERNAME_REGEX = /^[A-z0-9]{3,30}$/;

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const COUNTRY_REGEX = /^[A-Z]{2}$/;

const NAME_REGEX = /^[A-z ,.'-]{2,100}\b$/;

function createJoiErrorsObject(error) {
    const details = error.details;
    const errors = {};

    details.forEach(
        detail => errors[detail.path] = detail.message
    );

    return errors;
}

function createMongooseValidationErrorsObject(error) {
    const errors = error.errors;

    for(let errorPath of Object.keys(errors)) {
        errors[errorPath] = errors[errorPath].message;
    }

    return errors;
}

function validateSignupData(data) {
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
        'password-confirmation': Joi.any().valid(Joi.ref('password')).required().messages({
            'any.required': `Password confirmation is required.`,
            'any.only': `Password and password confirmation does not match.`
        }),
        'isAdmin': Joi.boolean().default(false).messages({
            'boolean.base': `isAdmin field must be a valid boolean value.`
        }),
        // TODO: Add whitelist validation with .allow method
        'country': Joi.string().regex(COUNTRY_REGEX).messages({
            'string.pattern.base': `Country must be a valid country code containing 2 uppercase letters.`
        })
    });

    return schema.validate(data, { abortEarly: false });
}

function validateLoginData(data) {
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

    return schema.validate(data, { abortEarly: false });
}

module.exports = {
    USERNAME_REGEX,
    EMAIL_REGEX,
    COUNTRY_REGEX,
    NAME_REGEX,
    createJoiErrorsObject,
    createMongooseValidationErrorsObject,
    validateSignupData,
    validateLoginData
};
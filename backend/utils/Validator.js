const Joi = require('joi');
const VALIDATION = require('../messages/validation');

class Validator {
    static USERNAME_REGEX = /^[A-z0-9]{3,30}$/;
    static NAME_REGEX = /^[A-z ,.'-]{2,100}\b$/;
    static EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    static COUNTRY_REGEX = /^[A-Z]{2}$/;

    static validateSignupData(user) {
        const schema = Joi.object({
            'username': Joi.string().min(3).max(30).alphanum().required().messages({
                'string.empty': VALIDATION.username['string.empty'],
                'string.min': VALIDATION.username['string.min'],
                'string.max': VALIDATION.username['string.max'],
                'string.alphanum': VALIDATION.username['string.alphanum'],
                'any.required': VALIDATION.username['any.required']
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
            'password-confirmation': Joi.any().valid(Joi.ref('password')).required().messages({
                'any.required': VALIDATION['password-confirmation']['any.required'],
                'any.only': VALIDATION['password-confirmation']['any.only']
            })
        });
    
        return schema.validate({
            'username': user.username,
            'email': user.email,
            'password': user.password,
            'password-confirmation': user.passwordConfirmation
        }, { abortEarly: false });
    }

    static validateLoginData(user) {
        const schema = Joi.object({
            'login': Joi.alternatives().required().try(
                Joi.string().min(3).max(30).alphanum(),
                Joi.string().email()
            ).messages({
                'alternatives.match': VALIDATION.login['alternatives.match'],
                'any.required': VALIDATION.login['any.required']
            }),
            'password': Joi.string().min(4).required().max(1024).messages({
                'string.empty': VALIDATION.password['string.empty'],
                'string.min': VALIDATION.password['string.min'],
                'string.max': VALIDATION.password['string.max'],
                'any.required': VALIDATION.password['any.required']
            })
        });
    
        return schema.validate({
            login: user.login,
            password: user.password
        }, { abortEarly: false });
    }

    static createJoiErrorsObject(error) {
        const details = error.details;
        const errors = {};
    
        details.forEach(
            detail => errors[detail.path] = detail.message
        );
    
        return errors;
    }
    
    static createMongooseValidationErrorsObject(error) {
        const errors = error.errors;
    
        for(let errorPath of Object.keys(errors)) {
            errors[errorPath] = errors[errorPath].message;
        }
    
        return errors;
    }
}

module.exports = Validator;
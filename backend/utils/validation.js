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

module.exports = {
    USERNAME_REGEX,
    EMAIL_REGEX,
    COUNTRY_REGEX,
    NAME_REGEX,
    createJoiErrorsObject,
    createMongooseValidationErrorsObject
};
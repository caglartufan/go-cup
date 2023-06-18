const mongoose = require('mongoose');
const {
    createJoiErrorsObject,
    createMongooseValidationErrorsObject
} = require('./validation');
const ERRORS = require('../messages/errors');
const debug = require('debug')('go-cup:error-handler');

// TODO http error sadece controlerda kullnılacak
class HTTPError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'HTTPError';
        this.status = status;
    }
}

class UserValidationError extends HTTPError {
    constructor(errors) {
        super(ERRORS.USER_DATA_VALIDATION_FAILED, 400);
        this.name = 'UserValidationError';
        this.errors = errors;
    }
}

class InvalidUserCredentialsError extends HTTPError {
    constructor() {
        super(ERRORS.INVALID_USER_CREDENTIALS, 401);
        this.name = 'InvalidUserCredentialsError';
    }
}

class InternalServerError extends HTTPError {
    constructor(message) {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}

class InvalidDTOError extends TypeError {
    constructor(object, ExpectedDTOClass) {
        let message = ERRORS.INVALID_DTO_OBJECT;
        message = message
            .replace('#{RECEIVED_CLASS}', object.constructor.name)
            .replace('#{EXPECTED_CLASS}', ExpectedDTOClass.name);

        super(message);
        this.name = 'InvalidDTOError';
    }
}

class ErrorHandler {
    static handle(error) {
        if(error instanceof mongoose.Error.ValidationError) {
            ErrorHandler.throwUserValidationMongooseError(error);
        } else {
            debug(error);
            ErrorHandler.throwInternalServerError(error.message);
        }
    }

    /*
    static throwInvalidDTOError(object, ExpectedDTOClass) {
        throw new InvalidDTOError(object, ExpectedDTOClass);
    }

    static throwUserValidationJoiError(error) {
        const errors = createJoiErrorsObject(error);

        throw new UserValidationError(errors);
    }

    static throwUserValidationMongooseError(error) {
        const errors = createMongooseValidationErrorsObject(error);

        throw new UserValidationError(errors);
    }

    static throwUserValidationDuplicationError(isDuplicateUsername, isDuplicateEmail) {
        const errors = {};
            
        if(isDuplicateUsername) {
            errors.username = ERRORS.DUPLICATE_USERNAME;
        }
        if(isDuplicateEmail) {
            errors.email = ERRORS.DUPLICATE_USERNAME;
        }

        throw new UserValidationError(errors);
    }

    static throwInvalidUserCredentialsError() {
        throw new InvalidUserCredentialsError();
    }

    static throwInternalServerError(message) {
        throw new InternalServerError(message);
    }*/
}

module.exports = ErrorHandler;
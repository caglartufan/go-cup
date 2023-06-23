const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const debug = require('debug')('go-cup:error-handler');
const ERRORS = require('../messages/errors');
const Validator = require('../utils/Validator');

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

    static fromJoiError(error) {
        const errors = Validator.createJoiErrorsObject(error);

        return new UserValidationError(errors);
    }

    static fromMongooseError(error) {
        const errors = Validator.createMongooseValidationErrorsObject(error);

        return new UserValidationError(errors);
    }

    static fromDuplicateUsernameOrEmail(isDuplicateUsername, isDuplicateEmail) {
        const errors = {};
            
        if(isDuplicateUsername) {
            errors.username = ERRORS.DUPLICATE_USERNAME;
        }
        if(isDuplicateEmail) {
            errors.email = ERRORS.DUPLICATE_USERNAME;
        }

        return new UserValidationError(errors);
    }
}

class InvalidUserCredentialsError extends HTTPError {
    constructor() {
        super(ERRORS.INVALID_USER_CREDENTIALS, 401);
        this.name = 'InvalidUserCredentialsError';
    }
}

class InvalidJWTError extends HTTPError {
    constructor() {
        super(ERRORS.INVALID_JWT, 401);
        this.name = 'InvalidJWTError';
    }
}

class ExpiredJWTError extends HTTPError {
    constructor() {
        super(ERRORS.EXPIRED_JWT, 401);
        this.name = 'ExpiredJWTError';
    }
}

class InternalServerError extends HTTPError {
    constructor(message) {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}

class NotFoundError extends HTTPError {
    constructor() {
        super(ERRORS.NOT_FOUND, 404);
        this.name = 'NotFoundError';
    }
}

class UserNotFoundError extends NotFoundError {
    constructor() {
        super();
        this.message = ERRORS.USER_NOT_FOUND;
        this.name = 'UserNotFoundError';
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
            return UserValidationError.fromMongooseError(error);
        } else if(error instanceof jwt.TokenExpiredError) {
            return new ExpiredJWTError();
        } else if(error instanceof jwt.JsonWebTokenError) {
            return new InvalidJWTError();
        } else {
            debug(error);
            if(error instanceof HTTPError || error instanceof InvalidDTOError) {
                return error;
            } else {
                return new InternalServerError(error.message);
            }
        }
    }
}

module.exports = {
    HTTPError,
    UserValidationError,
    InvalidUserCredentialsError,
    InvalidJWTError,
    ExpiredJWTError,
    InternalServerError,
    NotFoundError,
    UserNotFoundError,
    InvalidDTOError,
    ErrorHandler
};
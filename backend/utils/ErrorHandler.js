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
            errors.email = ERRORS.DUPLICATE_EMAIL;
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

class UnauthorizedError extends HTTPError {
    constructor() {
        super(ERRORS.UNAUTHORIZED, 401);
        this.name = 'UnauthorizedError';
    }
}

class UserNotFoundError extends NotFoundError {
    constructor() {
        super();
        this.message = ERRORS.USER_NOT_FOUND;
        this.name = 'UserNotFoundError';
    }
}

class GameNotFoundError extends NotFoundError {
    constructor() {
        super();
        this.message = ERRORS.GAME_NOT_FOUND;
        this.name = 'GameNotFoundError';
    }
}

class InvalidDTOError extends TypeError {
    constructor(object, ExpectedDTOClass) {
        let message = ERRORS.INVALID_DTO_OBJECT;
        message = message
            .replace('#{RECEIVED_CLASS}', object?.constructor.name)
            .replace('#{EXPECTED_CLASS}', ExpectedDTOClass.name);

        super(message);
        this.name = 'InvalidDTOError';
    }
}

class InvalidIOError extends TypeError {
    constructor(object) {
        let message = ERRORS.INVALID_IO_OBJECT;
        message = message.replace('#{RECEIVED_CLASS}', object?.constructor.name);

        super(message);
        this.name = 'InvalidIOError';
    }
}

class GameError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GameError';
    }
}

class GameHasNotStartedYetError extends GameError {
    constructor() {
        super(ERRORS.GAME_HAS_NOT_STARTED_YET);
        this.name = 'GameHasNotStartedYetError';
    }
}

class GameHasAlreadyFinishedOrCancelledError extends GameError {
    constructor() {
        super(ERRORS.GAME_HAS_ALREADY_FINISHED_OR_CANCELLED);
        this.name = 'GameHasAlreadyFinishedOrCancelledError';
    }
}

class GameIsNotFinishingError extends GameError {
    constructor() {
        super(ERRORS.GAME_IS_NOT_FINISHING);
        this.name = 'GameIsNotFinishingError';
    }
}

class NotYourTurnError extends GameError {
    constructor() {
        super(ERRORS.NOT_YOUR_TURN);
        this.name = 'NotYourTurnError';
    }
}

class YouDontHaveUndoRightsError extends GameError {
    constructor() {
        super(ERRORS.YOU_DONT_HAVE_UNDO_RIGHTS);
        this.name = 'YouDontHaveUndoRightsError';
    }
}

class YouCanNotSelectNeutralGroupsError extends GameError {
    constructor() {
        super(ERRORS.YOU_CAN_NOT_SELECT_NEUTRAL_GROUPS);
        this.name = 'YouCanNotSelectNeutralGroupsError';
    }
}

class ErrorHandler {
    static handle(error) {
        if(error instanceof mongoose.Error.ValidationError) {
            console.log(error);
            return UserValidationError.fromMongooseError(error);
        } else if(error instanceof jwt.TokenExpiredError) {
            return new ExpiredJWTError();
        } else if(error instanceof jwt.JsonWebTokenError) {
            return new InvalidJWTError();
        } else {
            debug(error);
            if(error instanceof HTTPError || error instanceof InvalidDTOError || error instanceof GameError) {
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
    UnauthorizedError,
    UserNotFoundError,
    GameNotFoundError,
    InvalidDTOError,
    InvalidIOError,
    GameHasAlreadyFinishedOrCancelledError,
    GameHasNotStartedYetError,
    GameIsNotFinishingError,
    NotYourTurnError,
    YouDontHaveUndoRightsError,
    YouCanNotSelectNeutralGroupsError,
    ErrorHandler
};
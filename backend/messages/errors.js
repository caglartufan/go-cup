const ERRORS = {
    USER_DATA_VALIDATION_FAILED: 'User data validation failed!',
    DUPLICATE_USERNAME: 'User name is already in use.',
    DUPLICATE_EMAIL: 'E-mail address is already in use.',
    INVALID_USER_CREDENTIALS: 'Invalid user credentials.',
    INVALID_JWT: 'Invalid JWT provided.',
    EXPIRED_JWT: 'Expired JWT provided.',
    INVALID_DTO_OBJECT: 'Received an object that is instance of #{RECEIVED_CLASS}, expected #{EXPECTED_CLASS}.',
    NOT_FOUND: 'Page or resource could not found!',
    USER_NOT_FOUND: 'Could not find user!'
};

module.exports = ERRORS;
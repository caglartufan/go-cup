const ERRORS = {
    USER_DATA_VALIDATION_FAILED: 'User data validation failed!',
    DUPLICATE_USERNAME: 'User name is already in use.',
    DUPLICATE_EMAIL: 'E-mail address is already in use.',
    INVALID_USER_CREDENTIALS: 'Invalid user credentials.',
    INVALID_DTO_OBJECT: 'Received an object that is instance of #{RECEIVED_CLASS}, expected #{EXPECTED_CLASS}.'
};

module.exports = ERRORS;
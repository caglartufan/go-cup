const ERRORS = {
    USER_DATA_VALIDATION_FAILED: 'User data validation failed!',
    DUPLICATE_USERNAME: 'User name is already in use.',
    DUPLICATE_EMAIL: 'E-mail address is already in use.',
    INVALID_USER_CREDENTIALS: 'Invalid user credentials.',
    INVALID_JWT: 'Invalid JWT provided.',
    EXPIRED_JWT: 'Expired JWT provided.',
    INVALID_DTO_OBJECT: 'Received an object that is instance of #{RECEIVED_CLASS}, expected #{EXPECTED_CLASS}.',
    INVALID_IO_OBJECT: 'Received an object that is instance of #{RECEIVED_CLASS} which is not a valid socket.io (io) object.',
    NOT_FOUND: 'Page or resource could not found!',
    UNAUTHORIZED: 'Unauthorized user.',
    USER_NOT_FOUND: 'Could not find user.',
    GAME_NOT_FOUND: 'Could not find game.',
    GAME_HAS_ALREADY_FINISHED_OR_CANCELLED: 'Game has already finished or cancelled.',
    GAME_HAS_NOT_STARTED_YET: 'Game has not started yet.',
    GAME_IS_NOT_FINISHING: 'GAme is not finishing.',
    NOT_YOUR_TURN: 'Not your turn.',
    YOU_DONT_HAVE_UNDO_RIGHTS: 'You don\'t have rights to request undo.',
    YOU_CAN_NOT_SELECT_NEUTRAL_GROUPS: 'You can\'t select neutral groups.'
};

module.exports = ERRORS;
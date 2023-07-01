const VALIDATION = {
    user: {
        'login': {
            'alternatives.match': 'Please enter a valid user name or e-mail address.',
            'any.required': 'User name or e-mail address is required.'
        },
        'username': {
            'string.empty': 'User name is required.',
            'string.min': 'User name must have at least {#limit} characters.',
            'string.max': 'User name must have less than {#limit} characters.',
            'string.alphanum': 'Username must be alphanumeric.',
            'string.pattern.base': 'User name must contain minimum 3 and maximum 30 alphanumeric characters.',
            'any.required': 'Username is required.'
        },
        'avatar': {
            'string.pattern.base': 'Avatar must be valid path pointing to JPG, JPEG or PNG file.'
        },
        'firstname': {
            'string.min': 'First name must have at least {#limit} characters.',
            'string.max': 'First name must have less than {#limit} characters.',
            'string.pattern.base': 'First name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.'
        },
        'lastname': {
            'string.min': 'Last name must have at least {#limit} characters.',
            'string.max': 'Last name must have less than {#limit} characters.',
            'string.pattern.base': 'Last name can only contain Latin letters, whitespace, comma, period, apostrophe or dash.'
        },
        'email': {
            'string.empty': 'E-mail address is required.',
            'string.email': 'E-mail address is not valid.',
            'any.required': 'E-mail address is required.'
        },
        'password': {
            'string.empty': 'Password is required.',
            'string.min': 'Password must have at least {#limit} characters.',
            'string.max': 'Password must have less than {#limit} characters.',
            'any.required': 'Password is required.'
        },
        'password-confirmation': {
            'any.required': 'Password confirmation is required.',
            'any.only': 'Password and password confirmation does not match.'
        },
        'country': {
            'string.pattern.base': 'Country must be a valid country code containing 2 uppercase letters.'
        },
        'isAdmin': {
            'boolean.base': 'isAdmin field must be a valid boolean value.'
        }
    },
    game: {
        size: {
            'any.required': 'Board size is required.',
            'any.only': 'Board size can only be 9x9, 13x13 or 19x19.'
        },
        status: {
            'any.only': 'Game status can only be waiting, started, finished, white_resigned or black_resigned.'
        }
    }
};

module.exports = VALIDATION;
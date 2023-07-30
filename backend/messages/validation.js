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
            'any.only': 'Game status can only be waiting, started, finishing, black_won, white_won, white_resigned, black_resigned, cancelled, cancelled_by_black or cancelled_by_white.'
        },
        moves: {
            player: {
                'any.required': 'Move requires a player (black or white) to be associated with.',
                'any.only': 'Move\'s associated player has to be either black or white.'
            },
            row: {
                'number.min': 'Move\'s associated row index must be minimum 0 and maximum 18.'
            },
            column: {
                'number.min': 'Move\'s associated column index must be minimum 0 and maximum 18.'
            },
        },
        groups: {
            player: {
                'any.required': 'Group requires a player (black or white) to be associated with.',
                'any.only': 'Group\'s associated player has to be either black or white.'
            },
            stones: {
                row: {
                    'any.required': 'Group stone requires a row index to be assoicated with.',
                    'number.min': 'Group stone\'s associated row index must be minimum 0 and maximum 18.'
                },
                column: {
                    'any.required': 'Group stone requires a column index to be assoicated with.',
                    'number.min': 'Group stone\'s associated column index must be minimum 0 and maximum 18.'
                },
                createdAtMove: {
                    'any.required': 'Group stone requires the index of the move to which it was created to be associated.',
                    'number.min': 'Group stone\'s associated index of the move to which it was created must be minimum 0.'
                },
                removedAtMove: {
                    'number.min': 'Group stone\'s associated index of the move to which it was removed must be minimum -1.'
                }
            },
            liberties: {
                row: {
                    'any.required': 'Group liberty requires a row index to be assoicated with.',
                    'number.min': 'Group liberty\'s associated row index must be minimum 0 and maximum 18.'
                },
                column: {
                    'any.required': 'Group liberty requires a column index to be assoicated with.',
                    'number.min': 'Group liberty\'s associated column index must be minimum 0 and maximum 18.'
                },
                createdAtMove: {
                    'any.required': 'Group liberty requires the index of the move to which it was created to be associated.',
                    'number.min': 'Group liberty\'s associated index of the move to which it was created must be minimum 0.'
                },
                removedAtMove: {
                    'number.min': 'Group liberty\'s associated index of the move to which it was removed must be minimum -1.'
                }
            },
            createdAtMove: {
                'any.required': 'Group requires the index of the move to which it was created to be associated.',
                'number.min': 'Group\'s associated index of the move to which it was created must be minimum 0.'
            },
            removedAtMove: {
                'number.min': 'Group\'s associated index of the move to which it was removed must be minimum -1.'
            }
        },
        kos: {
            row: {
                'any.required': 'Ko requires a row index to be assoicated with.',
                'number.min': 'Ko\'s associated row index must be minimum 0 and maximum 18.'
            },
            column: {
                'any.required': 'Ko requires a column index to be assoicated with.',
                'number.min': 'Ko\'s associated column index must be minimum 0 and maximum 18.'
            },
            createdAtMoves: {
                'any.required': 'Ko requires the index of the move to which it was created to be associated.',
                'number.min': 'Ko\'s associated index of the move to which it was created must be minimum 0.'
            }
        },
        black: {
            user: {
                'any.required': 'Black player\'s user id is required!',
            }
        },
        white: {
            user: {
                'any.required': 'White player\'s user id is required!',
            }
        },
        undo: {
            requestedBy: {
                'any.only': 'Undo can only be requested by black or white player.'
            }
        }
    }
};

module.exports = VALIDATION;
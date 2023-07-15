const mongoose = require('mongoose');
const { User } = require('./User');
const VALIDATION = require('../messages/validation');
const MESSAGES = require('../messages/messages');

const gameSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: [true, VALIDATION.game.size['any.required']],
        enum: {
            values: [9, 13, 19],
            message: VALIDATION.game.size['any.only']
        }
    },
    status: {
        type: String,
        enum: {
            values: ['waiting', 'started', 'black_won', 'white_won', 'white_resigned', 'black_resigned', 'cancelled', 'cancelled_by_black', 'cancelled_by_white'],
            message: VALIDATION.game.status['any.only']
        },
        default: 'waiting'
    },
    board: {
        type: [[Boolean]],
        default: function() {
            return Array.from(new Array(this.size), () => new Array(this.size));
        }
    },
    moves: [{
        player: {
            type: String,
            required: [true, VALIDATION.game.moves.player['any.required']],
            enum: {
                values: ['black', 'white'],
                message: VALIDATION.game.moves.player['any.only']
            }
        },
        row: {
            type: Number,
            required: [true, VALIDATION.game.moves.row['any.required']],
            min: [0, VALIDATION.game.moves.row['number.min']],
            max: [18, VALIDATION.game.moves.row['number.min']]
        },
        column: {
            type: Number,
            required: [true, VALIDATION.game.moves.column['any.required']],
            min: [0, VALIDATION.game.moves.column['number.min']],
            max: [18, VALIDATION.game.moves.column['number.min']]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    black: {
        user: {
            type: mongoose.Types.ObjectId,
            required: [true, VALIDATION.game.black.user['any.required']],
            ref: 'User'
        },
        score: {
            type: Number,
            min: 0,
            default: 0
        },
        timeRemaining: {
            type: Number,
            min: 0,
            default: 5 * 60
        }
    },
    white: {
        user: {
            type: mongoose.Types.ObjectId,
            required: [true, VALIDATION.game.white.user['any.required']],
            ref: 'User'
        },
        score: {
            type: Number,
            min: 0,
            default: .5
        },
        timeRemaining: {
            type: Number,
            min: 0,
            default: 5 * 60
        }
    },
    chat: {
        type: [{
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            message: {
                // TODO: Add some validation and XSS prevention
                type: String
            },
            isSystem: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: [{
            message: MESSAGES.models.Game.BEGINNING_OF_THE_CHAT,
            isSystem: true
        }]
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    startedAt: {
        type: Date
    },
    finishedAt: {
        type: Date
    },
    waitingEndsAt: {
        type: Date,
        default: function() {
            const now = new Date();
            
            // Game will be automatically cancelled after 20 minutes
            now.setMinutes(now.getMinutes() + 20);

            return now;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add game's id to white and black users' games array for reference
gameSchema.pre('save', async function() {
    if(this.isNew) {
        await User.updateMany({
            _id: {
                $in: [
                    this.black.user,
                    this.white.user
                ]
            }
        }, {
            $push: {
                games: this._id
            },
            activeGame: this._id
        });
    }
});

const Game = mongoose.model('Game', gameSchema);

exports.Game = Game;
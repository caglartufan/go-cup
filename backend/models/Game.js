const mongoose = require('mongoose');
const VALIDATION = require('../messages/validation');
const { User } = require('./User');

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
            values: ['waiting', 'started', 'finished', 'white_resigned', 'black_resigned', 'cancelled', 'cancelled_by_black', 'cancelled_by_white'],
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
        position: {
            type: String,
            required: [true, VALIDATION.game.moves.position['any.required']]
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
            isSystem: true,
            message: 'Beginning of the chat'
        }]
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    gameStartedAt: {
        type: Date
    },
    waitingEndsAt: {
        type: Date,
        default: function() {
            const now = new Date();
            
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
            }
        });
    }
});

const Game = mongoose.model('Game', gameSchema);

exports.Game = Game;
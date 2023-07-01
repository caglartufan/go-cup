const mongoose = require('mongoose');
const VALIDATION = require('../messages/validation');

const gameSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: [true, VALIDATION.game.size['any.required']],
        enum: [[9, 13, 19], VALIDATION.game.size['any.only']]
    },
    status: {
        type: String,
        enum: {
            values: ['waiting', 'started', 'finished', 'white_resigned', 'black_resigned'],
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
    white: {
        score: {
            type: Number,
            min: 0,
            default: 0
        },
        timeRemaning: {
            type: Number,
            min: 0,
            default: 5 * 60
        }
    },
    black: {
        score: {
            type: Number,
            min: 0,
            default: 0
        },
        timeRemaning: {
            type: Number,
            min: 0,
            default: 5 * 60
        }
    }
});

const Game = mongoose.model('Game', gameSchema);

exports.Game = Game;
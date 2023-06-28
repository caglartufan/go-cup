const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: true,
        enum: [9, 13, 19]
    },
    status: {
        type: String,
        enum: ['waiting', 'started', 'finished', 'white_resigned', 'black_resigned'],
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
            default: 0
        },
        timeRemaning: {
            type: Number,
            default: 5 * 60
        }
    },
    black: {
        score: {
            type: Number,
            default: 0
        },
        timeRemaning: {
            type: Number,
            default: 5 * 60
        }
    }
});

const Game = mongoose.model('Game', gameSchema);

exports.Game = Game;
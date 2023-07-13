const { default: mongoose } = require('mongoose');
const { Game } = require('../models/Game');

class GameDAO {
    static async getGames() {
        // TODO: Filter unnecessary data requested such as chat, waitingEndsAt etc.
        return await Game
            .find({ isPrivate: false })
            .populate('black.user', '-_id username elo')
            .populate('white.user', '-_id username elo');
    }

    static async findGameById(gameId) {
        return await Game
            .findOne({
                _id: gameId,
                isPrivate: false
            })
            .populate('black.user', '-_id username elo avatar')
            .populate('white.user', '-_id username elo avatar')
            .populate('chat.user', '-_id username elo');
    }

    static async cancelGamesThatAreTimedOutOnWaitingStatus() {
        const gameIdsToBeCancelled = await Game.find({
            status: 'waiting',
            waitingEndsAt: { $lte: Date.now() }
        }).distinct('_id');

        if(gameIdsToBeCancelled.length) {
            // TODO: @@@ Find a way to update socket with this cancelled message and move this message and
            // "beginning of the chat" message in Game model to messages folder
            await Game.updateMany({
                _id: { $in: gameIdsToBeCancelled }
            }, {
                status: 'cancelled',
                $push: {
                    chat: { message: 'The game has been cancelled!', isSystem: true }
                }
            });
        }

        return gameIdsToBeCancelled;
    }

    static async getSystemMessagesOfGamesByIds(gameIds) {
        if(gameIds instanceof Array) {
            return await Game.find({
                _id: { $in: gameIds },
                'chat.isSystem': true
            }).select('_id chat');
        } else if((typeof gameIds === 'string') || (gameIds instanceof mongoose.Types.ObjectId)) {
            return Game.findById(gameIds).select('_id chat');
        } else {
            return null;
        }
    }

    static async createGame(blackUserId, whiteUserId) {
        const game = new Game({
            size: 9,
            black: {
                user: blackUserId
            },
            white: {
                user: whiteUserId
            }
        });

        return await game.save();
    }
}

module.exports = GameDAO;
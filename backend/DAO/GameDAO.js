const { Game } = require('../models/Game');
const { GameNotFoundError } = require('../utils/ErrorHandler');
const MESSAGES = require('../messages/messages');

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
            // TODO:  move this message and "beginning of the chat" message in
            // Game model to messages folder
            await Game.updateMany({
                _id: { $in: gameIdsToBeCancelled }
            }, {
                status: 'cancelled',
                $push: {
                    chat: { message: MESSAGES.DAO.GameDAO.GAME_CANCELLED, isSystem: true }
                }
            });
        }

        return gameIdsToBeCancelled;
    }

    static async cancelGame(gameId, cancelledBy) {
        const game = await this.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        game.status = 'cancelled_by_' + cancelledBy;
        game.chat.push({
            message: MESSAGES.DAO.GameDAO.GAME_CANCELLED_BY.replace('#{CANCELLED_BY}', cancelledBy),
            isSystem: true
        });

        await game.save();

        return { _id: game._id, latestSystemChatEntry: game.chat.filter(chatEntry => chatEntry.isSystem === true).pop() }
    }

    static async getGamesWithLatestSystemChatEntryByGameIds(gameIds) {
        return await Game.aggregate([
            {
                $match: {
                    _id: { $in: gameIds }
                }
            },
            {
                $unwind: '$chat'
            },
            {
                $match: {
                    'chat.isSystem': true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    latestSystemChatEntry: { $last: '$chat' }
                }
            }
        ]);
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
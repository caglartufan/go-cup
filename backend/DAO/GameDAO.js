const { Game } = require('../models/Game');

class GameDAO {
    static async getGames() {
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
            .populate('white.user', '-_id username elo avatar');
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
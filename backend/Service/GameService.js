const GameDAO = require('../DAO/GameDAO');

class GameService {
    async getGames() {
        return await GameDAO.getGames();
    }
}

module.exports = GameService;
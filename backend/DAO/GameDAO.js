const { Game } = require('../models/Game');

class GameDAO {
    static async getGames() {
        return await Game.find();
    }
}

module.exports = GameDAO;
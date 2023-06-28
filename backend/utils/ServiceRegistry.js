const GameService = require('../Service/GameService');
const UserService = require('../Service/UserService');

class ServiceRegistry {
    #gameService;
    #userService;

    constructor() {
        this.#gameService = new GameService();
        this.#userService = new UserService();
    }

    get gameService() {
        return this.#gameService;
    }

    get userService() {
        return this.#userService;
    }
}

module.exports = ServiceRegistry;
const GameService = require('../Service/GameService');
const UserService = require('../Service/UserService');
const { InvalidIOError } = require('../utils/ErrorHandler');

class ServiceRegistry {
    #gameService;
    #userService;

    constructor(io) {
        if(!io) {
            throw new InvalidIOError();
        }

        this.#gameService = new GameService(io);
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
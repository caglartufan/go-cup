const UserService = require("../Service/UserService");

class ServiceRegistry {
    #userService;

    constructor() {
        this.#userService = new UserService();
    }

    get userService() {
        return this.#userService;
    }
}

module.exports = ServiceRegistry;
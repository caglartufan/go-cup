const GameDAO = require('../DAO/GameDAO');
const UserDTO = require('../DTO/UserDTO');
const { InvalidDTOError, UserNotFoundError } = require('../utils/ErrorHandler');

class GameService {
    queue = [];
    #io = null;
    #processing = false;
    #interval = null;

    constructor(io) {
        this.#io = io;
    }

    async getGames() {
        return await GameDAO.getGames();
    }

    enqueue(user, preferences) {
        if(!(user instanceof UserDTO)) {
            throw new InvalidDTOError(user, UserDTO);
        }

        const queueObject = {
            user,
            preferences,
            since: new Date()
        };

        const isUserAlreadyInQueue = this.queue.findIndex(
            queueObject => queueObject.user.username === user.username
        ) > -1;
        if(isUserAlreadyInQueue) {
            return;
        }

        this.queue.push(queueObject);

        if(this.queue.length >= 2 && !this.#processing) {
            console.log('starting...');
            this.#startProcessingQueue();
        }
    }

    dequeue(user) {
        const queueObjectIndex = this.queue.findIndex(queueObject => queueObject.user.username === user.username);

        if(queueObjectIndex === -1) {
            return;
        }

        this.queue.splice(queueObjectIndex, 1);

        if(this.queue.length < 2 && this.#processing) {
            console.log('stopping...');
            this.#stopProcessingQueue();
        }
    }

    #startProcessingQueue() {
        this.#interval = setInterval(() => {
            // TODO: Implement an algorithm to match players in queue
            // @@@ Implmenet Uı elements to start search and view search
            // information like currently searching, currently online,
            // time elapsed since beginning of search process
            // estimated time (if possible) and a way to cancel
            // Then implement a way to match players in here (in a simple way)
            console.log('processing queue...');
            this.queue
        }, 1000);
        this.#processing = true;
    }

    #stopProcessingQueue() {
        clearInterval(this.#interval);
        this.#processing = false;
    }

    isUserInQueue(username) {
        return this.queue.findIndex(queueObject => queueObject.user.username === username) > -1;
    }

    timeElapsedOfUser(username) {
        const queueObject = this.queue.find(queueObject => queueObject.user.username === username);

        if(!queueObject) {
            throw new UserNotFoundError();
        }

        return Date.now() - queueObject.since;
    }

    // TODO: Remove this method and related route when need no more
    getQueue() {
        return this.queue.map(queueObject => ({ ...queueObject, user: queueObject.user.toObject() }));
    }
}

module.exports = GameService;
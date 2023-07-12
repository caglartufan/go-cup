class GameDTO {
    #_id;
    #size;
    #status;
    #board;
    #moves;
    #black;
    #white;
    #chat;
    #isPrivate;
    #gameStartedAt;
    #waitingEndsAt;
    #createdAt;

    constructor(_id, size, status, board, moves, black, white, chat, isPrivate, gameStartedAt, waitingEndsAt, createdAt) {
        this.#_id = _id;
        this.#size = size;
        this.#status = status;
        this.#board = board;
        this.#moves = moves;
        this.#black = black;
        this.#white = white;
        this.#chat = chat;
        this.#isPrivate = isPrivate;
        this.#gameStartedAt = gameStartedAt;
        this.#waitingEndsAt = waitingEndsAt;
        this.#createdAt = createdAt;
    }

    static withGameObject(game) {
        return new GameDTO(
            game._id,
            game.size,
            game.status,
            game.board,
            game.moves,
            game.black,
            game.white,
            game.chat,
            game.isPrivate,
            game.gameStartedAt,
            game.waitingEndsAt,
            game.createdAt
        );
    }

    toObject() {
        return {
            _id: this.#_id,
            size: this.#size,
            status: this.#status,
            board: this.#board,
            moves: this.#moves,
            black: this.#black,
            white: this.#white,
            chat: this.#chat,
            isPrivate: this.#isPrivate,
            gameStartedAt: this.#gameStartedAt,
            waitingEndsAt: this.#waitingEndsAt,
            createdAt: this.#createdAt
        };
    }

    get _id() {
        return this.#_id;
    }

    get size() {
        return this.#size;
    }

    get status() {
        return this.#status;
    }

    get board() {
        return this.#board;
    }

    get moves() {
        return this.#moves;
    }

    get black() {
        return this.#black;
    }

    get white() {
        return this.#white;
    }

    get chat() {
        return this.#chat;
    }

    get isPrivate() {
        return this.#isPrivate;
    }

    get gameStartedAt() {
        return this.#gameStartedAt;
    }

    get waitingEndsAt() {
        return this.#waitingEndsAt;
    }

    get createdAt() {
        return this.#createdAt;
    }
}

module.exports = GameDTO;
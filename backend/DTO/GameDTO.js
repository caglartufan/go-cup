class GameDTO {
    #_id;
    #size;
    #status;
    #board;
    #moves;
    #black;
    #white;
    #isPrivate;
    #createdAt;

    constructor(_id, size, status, board, moves, black, white, isPrivate, createdAt) {
        this.#_id = _id;
        this.#size = size;
        this.#status = status;
        this.#board = board;
        this.#moves = moves;
        this.#black = black;
        this.#white = white;
        this.#isPrivate = isPrivate;
        this.#createdAt = createdAt;
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
            isPrivate: this.#isPrivate,
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

    get isPrivate() {
        return this.#isPrivate;
    }

    get createdAt() {
        return this.#createdAt;
    }
}

module.exports = GameDTO;
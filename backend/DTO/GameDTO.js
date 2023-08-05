class GameDTO {
    #_id;
    #size;
    #status;
    #board;
    #moves;
    #groups;
    #emptyGroups;
    #kos;
    #black;
    #white;
    #chat;
    #undo;
    #isPrivate;
    #startedAt;
    #finishedAt;
    #waitingEndsAt;
    #createdAt;

    constructor(_id, size, status, board, moves, groups, emptyGroups, kos, black, white, chat, undo, isPrivate, startedAt, finishedAt, waitingEndsAt, createdAt) {
        this.#_id = _id;
        this.#size = size;
        this.#status = status;
        this.#board = board;
        this.#moves = moves;
        this.#groups = groups;
        this.#emptyGroups = emptyGroups;
        this.#kos = kos;
        this.#black = black;
        this.#white = white;
        this.#chat = chat;
        this.#undo = undo;
        this.#isPrivate = isPrivate;
        this.#startedAt = startedAt;
        this.#finishedAt = finishedAt;
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
            game.groups,
            game.emptyGroups,
            game.kos,
            game.black,
            game.white,
            game.chat,
            game.undo,
            game.isPrivate,
            game.startedAt,
            game.finishedAt,
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
            groups: this.#groups,
            emptyGroups: this.#emptyGroups,
            kos: this.#kos,
            black: this.#black,
            white: this.#white,
            chat: this.#chat,
            undo: this.#undo,
            isPrivate: this.#isPrivate,
            startedAt: this.#startedAt,
            finishedAt: this.#finishedAt,
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

    get groups() {
        return this.#groups;
    }

    get emptyGroups() {
        return this.#emptyGroups;
    }

    get kos() {
        return this.#kos;
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

    get undo() {
        return this.#undo;
    }

    get isPrivate() {
        return this.#isPrivate;
    }

    get startedAt() {
        return this.#startedAt;
    }

    get finishedAt() {
        return this.#finishedAt;
    }

    get waitingEndsAt() {
        return this.#waitingEndsAt;
    }

    get createdAt() {
        return this.#createdAt;
    }
}

module.exports = GameDTO;
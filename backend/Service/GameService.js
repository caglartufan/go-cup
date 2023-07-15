const mongoose = require('mongoose');
const GameDAO = require('../DAO/GameDAO');
const UserDAO = require('../DAO/UserDAO');
const UserDTO = require('../DTO/UserDTO');
const { InvalidDTOError, UserNotFoundError, GameNotFoundError, UnauthorizedError } = require('../utils/ErrorHandler');
const GameDTO = require('../DTO/GameDTO');

class GameService {
    queue = [];
    #io = null;
    #processing = false;
    #gameProcessInterval = null;
    #cancelledGamesInterval = null;

    constructor(io) {
        this.#io = io;

        this.#cancelledGamesInterval = setInterval(() => {
            this.#cancelMatchesThatAreTimedOutOnWaitingStatus();
        }, 1000);
    }

    async getGames() {
        const games = await GameDAO.getGames();

        const gameDTOs = games.map(game => GameDTO.withGameObject(game));

        return gameDTOs;
    }

    async findGameById(gameId) {
        if(!mongoose.isValidObjectId(gameId)) {
            throw new GameNotFoundError();
        }

        const game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        const gameDTO = GameDTO.withGameObject(game);

        return gameDTO;
    }

    async createChatEntryByGameId(gameId, userId, message) {
        if(!mongoose.isValidObjectId(gameId)) {
            throw new GameNotFoundError();
        }

        const game = await GameDAO.findGameById(gameId);

        game.chat.push({
            user: userId,
            message
        });

        await game.save();

        await game.populate('chat.' + (game.chat.length - 1) + '.user', '-_id username elo');

        const chatEntry = game.chat.pop();

        return chatEntry;
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
        this.#gameProcessInterval = setInterval(() => {
            console.log('processing queue...');
            // Current date when this loop of process has started
            const processDate = new Date();
            // An array to hold players who will be playing match (matched) in from of [[player1, player2], [player3, player4], ...]
            const matchedPlayers = [];
            
            // Sort queue by "since" property (the date when user joined in queue) in ascending order
            this.queue.sort(
                (queueObjA, queueObjB) => queueObjA.since - queueObjB.since
            );

            for(const queueObject of this.queue) {
                const userElo = queueObject.user.elo;
                const userTimeElapsed = processDate - queueObject.since;
                // Concatenate players in matchedPlayers array. This will produce an array which has all the matched users in form [player1, player2, player3, player4, ...]
                const concatenatedMatchedPlayers = matchedPlayers.reduce((prev, curr) => prev.concat(curr), []);

                // Skip if user has already been matched with another player
                if(concatenatedMatchedPlayers.find(matchedPlayer => matchedPlayer.username === queueObject.user.username)) {
                    break;
                }

                for(const comparedQueueObject of this.queue) {
                    // Skip if user and compared user are same
                    if(queueObject.user.username === comparedQueueObject.user.username) {
                        break;
                    }

                    // Skip if compared user has already been matched with another player
                    if(concatenatedMatchedPlayers.find(matchedPlayer => matchedPlayer.username === comparedQueueObject.user.username)) {
                        break;
                    }

                    const comparedUserElo = comparedQueueObject.user.elo;
                    const comparedUserTimeElapsed = processDate - comparedQueueObject.since;
                    const eloDifference = Math.abs(userElo - comparedUserElo);
                    
                    if(
                        (eloDifference >= 0 && eloDifference < 25)
                        || ((eloDifference >= 25 && eloDifference < 50)
                           && (userTimeElapsed > (60 * 1000) && comparedUserTimeElapsed > (60 * 1000)))
                        || ((eloDifference >= 50 && eloDifference < 100)
                           && (userTimeElapsed > (2 * 60 * 1000) && comparedUserTimeElapsed > (2 * 60 * 1000)))
                        || ((eloDifference >= 100 && eloDifference < 150)
                           && (userTimeElapsed > (3 * 60 * 1000) && comparedUserTimeElapsed > (3 * 60 * 1000)))
                        || ((eloDifference >= 150 && eloDifference < 250)
                           && (userTimeElapsed > (4 * 60 * 1000) && comparedUserTimeElapsed > (4 * 60 * 1000)))
                        || ((eloDifference >= 250)
                           && (userTimeElapsed > (5 * 60 * 1000) && comparedUserTimeElapsed > (5 * 60 * 1000)))
                    ) {
                        // If both user and compared user fit into the conditions above add them together into matchedPlayers array
                        matchedPlayers.push([
                            queueObject.user,
                            comparedQueueObject.user
                        ]);
                    } else {
                        // If not skip
                        break;
                    }
                }
            }

            // Directly match players who are matched
            if(matchedPlayers.length > 0) {
                matchedPlayers.forEach(players => {
                    const firstPlayer = players[0];
                    const secondPlayer = players[1];
                    const colorsAssociatedWithPlayers = {
                        black: null,
                        white: null
                    };
        
                    // Player with less elo starts as black
                    if(firstPlayer.elo < secondPlayer.elo) {
                        colorsAssociatedWithPlayers.black = firstPlayer;
                        colorsAssociatedWithPlayers.white = secondPlayer;
                    } else if(firstPlayer.elo > secondPlayer.elo) {
                        colorsAssociatedWithPlayers.black = secondPlayer;
                        colorsAssociatedWithPlayers.white = firstPlayer;
                    // If both players have same elo, then randomly (50% chance) decide who will play as black or white
                    } else {
                        if(Math.random() < .5) {
                            colorsAssociatedWithPlayers.black = firstPlayer;
                            colorsAssociatedWithPlayers.white = secondPlayer;
                        } else {
                            colorsAssociatedWithPlayers.black = secondPlayer;
                            colorsAssociatedWithPlayers.white = firstPlayer;
                        }
                    }
    
                    // Start a new game between those players with colors assigned
                    this.#startGame(colorsAssociatedWithPlayers);
                });
            }
        }, 1000);
        this.#processing = true;
    }

    #stopProcessingQueue() {
        clearInterval(this.#gameProcessInterval);
        this.#processing = false;
    }

    async #startGame(colorsAssociatedWithPlayers) {
        const { black, white } = colorsAssociatedWithPlayers;

        this.dequeue(black);
        this.dequeue(white);

        console.log(`Starting a match between ${black.username} (black) and ${white.username} (white)!`);

        
        const [blackUserId, whiteUserId] = await UserDAO.getUserIdsByUsernames(black.username, white.username);
        
        const game = await GameDAO.createGame(blackUserId, whiteUserId);

        const sockets = await this.#io.in('queue').fetchSockets();
        const playerSockets = sockets.filter(
            socket => socket.data.user.username === black.username || socket.data.user.username === white.username
        );

        playerSockets.forEach(socket => {
            socket.leave('queue');

            if(socket.data.user.games?.length) {
                socket.data.user.games.push(game._id);
            } else {
                socket.data.user.games = [game._id];
            }

            socket.data.user.activeGame = game._id;
        });

        this.#io.to([black.username, white.username]).emit('gameStarted', game._id);
    }

    async #cancelMatchesThatAreTimedOutOnWaitingStatus() {
        const { gameIds, users } = await GameDAO.cancelGamesThatAreTimedOutOnWaitingStatusAndReturnGameIdsAndUserIds();
        
        if(gameIds.length && users.length) {
            const gamesWithLatestSystemChatEntry = await GameDAO.getGamesWithLatestSystemChatEntryByGameIds(gameIds);

            await UserDAO.nullifyActiveGameOfUsers(...users);

            const sockets = await this.#io.fetchSockets();
            const playerSockets = sockets.filter(
                socket => users.findIndex(
                    user => user.username === socket.data.user.username
                ) > -1
            );
    
            playerSockets.forEach(socket => {
                socket.data.user.activeGame = null;
            });

            gamesWithLatestSystemChatEntry.forEach(({ _id: gameId, latestSystemChatEntry }) => {
                this.#io.in('game-' + gameId).emit('gameChatMessage', latestSystemChatEntry);
                this.#io.in('game-' + gameId).emit('gameCancelled', gameId);
            });
        }
    }

    async cancelGame(gameId, username) {
        const game = await this.findGameById(gameId);

		const isPlayer = game.black.user.username === username || game.white.user.username === username;

		if(isPlayer && game.status === 'waiting') {
            const cancelledBy = game.black.user.username === username ? 'black' : 'white';

			const { latestSystemChatEntry } = await GameDAO.cancelGame(gameId, cancelledBy);

            await UserDAO.nullifyActiveGameOfUsers(game.black.user, game.white.user);
            
            const sockets = await this.#io.fetchSockets();
            const playerSockets = sockets.filter(
                socket => socket.data.user.username === game.black.user.username || socket.data.user.username === game.white.user.username
            );
    
            playerSockets.forEach(socket => {
                socket.data.user.activeGame = null;
            });

            return { cancelledBy, latestSystemChatEntry };
		} else {
            return false;
        }
    }

    async addStoneToTheGame(user, gameId, row, column) {
        const game = await this.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        const isBlackPlayer = user.username === game.black.user.username;
        const isWhitePlayer = user.username === game.white.user.username;
        const isPlayer = isBlackPlayer || isWhitePlayer;

        if(!isPlayer) {
            throw new UnauthorizedError();
        }

        let whosTurn = 'black';
        if(game.moves.length) {
            const lastMove = game.moves[game.moves.length - 1];
            if(lastMove.player === 'black') {
                whosTurn = 'white';
            }
        }

        if(
            (isBlackPlayer && whosTurn === 'white')
            || (isWhitePlayer && whosTurn === 'black')
        ) {
            throw new Error('Not your turn!');
        }

        // @@@ KEEP GOING MODIFY MODEL
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
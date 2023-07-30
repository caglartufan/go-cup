const mongoose = require('mongoose');
const GameDAO = require('../DAO/GameDAO');
const UserDAO = require('../DAO/UserDAO');
const UserDTO = require('../DTO/UserDTO');
const { InvalidDTOError, UserNotFoundError, GameNotFoundError, UnauthorizedError, GameHasAlreadyFinishedOrCancelledError, NotYourTurnError, YouDontHaveUndoRightsError, GameHasNotStartedYetError } = require('../utils/ErrorHandler');
const GameDTO = require('../DTO/GameDTO');

class GameService {
    queue = [];
    #io = null;
    #processing = false;
    #gameProcessInterval = null;
    #generalInterval = null;

    constructor(io) {
        this.#io = io;

        this.#generalInterval = setInterval(() => {
            this.#cancelGamesThatAreTimedOutOnWaitingStatus();
            this.#finishGamesThatPlayerRanOutOfTime();
            this.#updateGamesThatHaveTimedOutUndoRequest();
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

        console.log(`Starting a game between ${black.username} (black) and ${white.username} (white)!`);

        const usersWithIdAndUsername = await UserDAO.getUserIdsByUsernames(black.username, white.username);

        black._id = usersWithIdAndUsername.find(user => user.username === black.username)?._id;
        white._id = usersWithIdAndUsername.find(user => user.username === white.username)?._id;
        
        const game = await GameDAO.createGame(black._id, white._id);

        const sockets = await this.#io.in('queue').fetchSockets();
        const playerSockets = sockets.filter(
            socket => socket.data.user?.username === black.username || socket.data.user?.username === white.username
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

    async #cancelGamesThatAreTimedOutOnWaitingStatus() {
        const { gameIds, users } = await GameDAO.cancelGamesThatAreTimedOutOnWaitingStatusAndReturnGameIdsAndUserIds();
        
        if(!gameIds.length && !users.length) {
            return;
        }

        const gamesWithLatestSystemChatEntry = await GameDAO.getGamesWithLatestSystemChatEntryByGameIds(gameIds);

        await UserDAO.nullifyActiveGameOfUsers(...users);

        const sockets = await this.#io.fetchSockets();
        const playerSockets = sockets.filter(
            socket => users.some(
                user => user.username === socket.data.user?.username
            )
        );

        playerSockets.forEach(socket => {
            socket.data.user.activeGame = null;
        });

        gamesWithLatestSystemChatEntry.forEach(({ _id: gameId, latestSystemChatEntry }) => {
            this.#io.in('game-' + gameId).emit('gameChatMessage', latestSystemChatEntry);
            this.#io.in('game-' + gameId).emit('gameCancelled', gameId);
        });
    }

    async #finishGamesThatPlayerRanOutOfTime() {
        const { gameIds, users } = await GameDAO.finishGamesThatPlayerRanOutOfTimeAndReturnGameIdsAndUserIds();
        
        if(!gameIds.length || !users.length) {
            return;
        }

        const gamesWithStatusAndLatestSystemChatEntry = await GameDAO.getGamesWithLatestSystemChatEntryByGameIds(gameIds);

        await UserDAO.nullifyActiveGameOfUsers(...users);

        const sockets = await this.#io.fetchSockets();
        const playerSockets = sockets.filter(
            socket => users.some(
                user => user.username === socket.data.user?.username
            )
        );

        playerSockets.forEach(socket => {
            socket.data.user.activeGame = null;
        });

        gamesWithStatusAndLatestSystemChatEntry.forEach(
            ({ _id: gameId, status, black, white, latestSystemChatEntry }) => {
                this.#io.in('game-' + gameId).emit('gameChatMessage', latestSystemChatEntry);
                this.#io.in('game-' + gameId).emit('gameFinished', gameId, status, black, white);
            }
        );
    }

    async #updateGamesThatHaveTimedOutUndoRequest() {
        const games = await GameDAO.updateGamesThatHaveTimedOutUndoRequestAndReturnGames();

        if(!games.length) {
            return;
        }

        games.forEach(({ _id: gameId, requestedBy }) => {
            this.#io.in('game-' + gameId).emit('undoRequestRejected', requestedBy);
        });
    }

    async cancelGame(gameId, username) {
        const game = await this.findGameById(gameId);

		const isPlayer = game.black.user.username === username || game.white.user.username === username;

        if(!isPlayer || game.status !== 'waiting') {
            return false;
        }

        const cancelledBy = game.black.user.username === username ? 'black' : 'white';

        const { latestSystemChatEntry } = await GameDAO.cancelGame(gameId, cancelledBy);

        await UserDAO.nullifyActiveGameOfUsers(game.black.user, game.white.user);
        
        const sockets = await this.#io.fetchSockets();
        const playerSockets = sockets.filter(
            socket => socket.data.user?.username === game.black.user.username || socket.data.user?.username === game.white.user.username
        );

        playerSockets.forEach(socket => {
            socket.data.user.activeGame = null;
        });

        return { cancelledBy, latestSystemChatEntry };
    }

    async resignFromGame(gameId, username) {
        const game = await this.findGameById(gameId);

		const isPlayer = game.black.user.username === username || game.white.user.username === username;

		if(!isPlayer || game.status !== 'started') {
            return false;
        }

        const resignedPlayer = game.black.user.username === username ? 'black' : 'white';

        const { latestSystemChatEntry } = await GameDAO.resignFromGame(gameId, resignedPlayer);

        await UserDAO.nullifyActiveGameOfUsers(game.black.user, game.white.user);
        
        const sockets = await this.#io.fetchSockets();
        const playerSockets = sockets.filter(
            socket => socket.data.user?.username === game.black.user.username || socket.data.user?.username === game.white.user.username
        );

        playerSockets.forEach(socket => {
            socket.data.user.activeGame = null;
        });

        return { resignedPlayer, latestSystemChatEntry };
    }

    async requestUndo(gameId, username) {
        const game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        const {
            isBlackPlayer,
            isWhitePlayer,
            isPlayer,
            lastMove,
        } = this.#findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(username, game);

        const requestedBy = lastMove.player;
        const isPlayerAbleToRequestUndo = game.status === 'started' && isPlayer && ((requestedBy === 'black' && isBlackPlayer) || (requestedBy === 'white' && isWhitePlayer));

		if(!isPlayerAbleToRequestUndo) {
            return false;
        }

        if(game[requestedBy].undoRights === 0) {
            throw new YouDontHaveUndoRightsError();
        }

        game.undo.requestedBy = requestedBy;
        game.undo.requestedAt = new Date();
        game.undo.requestEndsAt = game.undo.requestedAt.setSeconds(
            game.undo.requestedAt.getSeconds() + 30
        );

        game[requestedBy].undoRights--;

        await game.save();

        const gameDTO = GameDTO.withGameObject(game);

        return {
            requestedBy,
            game: gameDTO
        };
    }

    async rejectUndoRequest(gameId, username) {
        const game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        if(!game.undo.requestedBy && !game.undo.requestedAt && !game.undo.requestEndsAt) {
            return false;
        }

        const {
            isBlackPlayer,
            isWhitePlayer,
            isPlayer
        } = this.#findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(username, game);

        const requestedBy = game.undo.requestedBy;
        const isPlayerAbleToAnswerUndoRequest = game.status === 'started' && isPlayer && ((requestedBy === 'black' && isWhitePlayer) || (requestedBy === 'white' && isBlackPlayer));

		if(!isPlayerAbleToAnswerUndoRequest) {
            return false;
        }

        game.undo.requestedBy = null;
        game.undo.requestedAt = null;
        game.undo.requestEndsAt = null;

        await game.save();
        
        return requestedBy;
    }

    async acceptUndoRequest(gameId, username) {
        let game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        if(!game.undo.requestedBy && !game.undo.requestedAt && !game.undo.requestEndsAt) {
            return false;
        }

        const {
            isBlackPlayer,
            isWhitePlayer,
            isPlayer
        } = this.#findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(username, game);

        const requestedBy = game.undo.requestedBy;
        const isPlayerAbleToAnswerUndoRequest = game.status === 'started' && isPlayer && ((requestedBy === 'black' && isWhitePlayer) || (requestedBy === 'white' && isBlackPlayer));

		if(!isPlayerAbleToAnswerUndoRequest) {
            return false;
        }

        game = this.#undoLastMoveOfGame(game);

        game.undo.requestedBy = null;
        game.undo.requestedAt = null;
        game.undo.requestEndsAt = null;

        await game.save();

        const gameDTO = GameDTO.withGameObject(game);
        
        return { requestedBy, game: gameDTO };
    }

    async pass(gameId, username) {
        let game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        // TODO: Make sure there's this validation on other method like undo etc.
        if(game.status !== 'started') {
            throw new GameHasNotStartedYetError();
        }

        const {
            isPlayer,
            isPlayersTurn,
            lastMove,
            whosTurn
        } = this.#findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(username, game);

        // TODO: Make sure there's this validation on other method like undo etc.
        if(!isPlayer) {
            throw new UnauthorizedError();
        }

        // TODO: Make sure there's this validation on other method like undo etc.
        if(!isPlayersTurn) {
            throw new NotYourTurnError();
        }

        const currentMoveAt = new Date();
        const turnPlayersCurrentTimeRemaining = this.#calculateTurnPlayersCurrentTimeRemaining(game, whosTurn, currentMoveAt, lastMove);
        
        if(turnPlayersCurrentTimeRemaining < 0) {
            throw new GameHasAlreadyFinishedOrCancelledError();
        }

        game.moves.push({
            player: whosTurn,
            pass: true
        });

        game[whosTurn].timeRemaining = turnPlayersCurrentTimeRemaining;

        if(lastMove.pass) {
            game.status = 'finishing';
        }

        await game.save();

        const gameDTO = GameDTO.withGameObject(game);
        
        return gameDTO;
    }

    async addStoneToTheGame(user, gameId, row, column) {
        const game = await GameDAO.findGameById(gameId);

        if(!game) {
            throw new GameNotFoundError();
        }

        if(game.status !== 'waiting' && game.status !== 'started') {
            throw new GameHasAlreadyFinishedOrCancelledError();
        }

        const {
            isPlayer,
            lastMove,
            whosTurn,
            isPlayersTurn
        } = this.#findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(user.username, game);

        if(!isPlayer) {
            throw new UnauthorizedError();
        }

        if(!isPlayersTurn) {
            throw new NotYourTurnError();
        }

        const currentMoveAt = new Date();
        const turnPlayersCurrentTimeRemaining = this.#calculateTurnPlayersCurrentTimeRemaining(game, whosTurn,  currentMoveAt, lastMove);
        
        if(turnPlayersCurrentTimeRemaining < 0) {
            throw new GameHasAlreadyFinishedOrCancelledError();
        }

        if(game.status === 'waiting') {
            game.status = 'started';
            game.startedAt = currentMoveAt;
        }

        // Do nothing if there's already a stone at position where new stone is wanted to be added
        if(game.board[row]?.[column] !== null) {
            return;
        }

        // Calculate the liberty points of added stone and check if it's a suicide move
        const { liberties, suicide } = this.#calculateLibertyPointsOfGivenPoint(game, row, column, whosTurn);

        // Find adjecent (neighbouring) groups and separate them as
        // turn player's groups and opponent's groups
        const activeGroups = game.groups.filter(
            group => group.removedAtMove === -1
        );
        const turnPlayersGroups = [];
        const opponentsGroups = [];

        // Check if stone is placed at liberty point of existing groups
        activeGroups.forEach(group => {
            const isTurnPlayersGroup = group.player === whosTurn;
            const isAddedStoneCapturingALibertyOfGroup = group.liberties.some(
                liberty => liberty.row === row && liberty.column === column && liberty.removedAtMove === -1
            );

            if(isAddedStoneCapturingALibertyOfGroup) {
                if(isTurnPlayersGroup) {
                    turnPlayersGroups.push(group);
                } else {
                    opponentsGroups.push(group);
                }
            }
        });

        // Check if stone added captures any of opponent's groups
        const isCapturingAnyOfOpponentsGroups = opponentsGroups.some(group => {
            const libertiesOfGroup = group.liberties.filter(
                liberty => liberty.removedAtMove === -1
            );

            if(libertiesOfGroup.length !== 1) {
                return false;
            }
            
            const lastLibertyPointOfGroup = libertiesOfGroup[0];
            const isAddedStoneLastLibertyPointOfGroup = lastLibertyPointOfGroup.row === row && lastLibertyPointOfGroup.column === column;

            return isAddedStoneLastLibertyPointOfGroup;
        });

        // Find disallowed ko positions for future use (to check if stone added to a position
        // which was disallowed due to a ko position or to allow disallowed ko positions after
        // a valid move)
        const disallowedKoPositions = game.kos.filter(
            ko => !ko.allowed
        );
            
        // Check if stone is added to a position which was disallowed due to a ko
        const isNotAllowedDueToKo = disallowedKoPositions.some(
            ko => ko.row === row && ko.column === column
        );

        // Check if move is allowed
        if(!liberties.length && suicide && (!isCapturingAnyOfOpponentsGroups || isNotAllowedDueToKo)) {
            return;
        }

        // Add stone to the poisiton (true for black, false for white stone)
        game.board[row][column] = whosTurn === 'black'; // true or false

        // Accept the stone added and add move
        game.moves.push({
            player: whosTurn,
            row,
            column,
            createdAt: currentMoveAt
        });

        // Store current move's index to use it for createdAtMove, removedAtMove fields
        const currentMoveIndex = game.moves.length - 1;

        // Allow the positions that were disallowed due to a ko
        disallowedKoPositions.forEach(ko => {
            ko.allowed = true;
        });

        // Remove liberty point of both turn player's and opponent's
        // groups that was captured by added stone
        [].concat(turnPlayersGroups, opponentsGroups).forEach(group => {
            const capturedLiberty = group.liberties.find(
                liberty => liberty.row === row && liberty.column === column && liberty.removedAtMove === -1
            );

            // Remove the liberty point
            capturedLiberty.removedAtMove = currentMoveIndex;
        });

        if(turnPlayersGroups.length) {
            if(turnPlayersGroups.length === 1) {
                const group = turnPlayersGroups[0];

                // Add stone to the stones of group
                group.stones.push({
                    row,
                    column,
                    createdAtMove: currentMoveIndex,
                    removedAtMove: -1
                });

                // Merge added stone's liberties with group's liberties
                liberties.forEach(libertyToBeAdded => {
                    if(
                        !group.liberties.find(
                            existingLiberty =>
                                existingLiberty.row === libertyToBeAdded.row
                                && existingLiberty.column === libertyToBeAdded.column
                                && existingLiberty.removedAtMove === -1
                        )
                    ) {
                        group.liberties.push({
                            ...libertyToBeAdded,
                            createdAtMove: currentMoveIndex,
                            removedAtMove: -1
                        });
                    }
                });
            } else {
                const mergedGroup = {
                    player: whosTurn,
                    stones: [{
                        row,
                        column,
                        createdAtMove: currentMoveIndex,
                        removedAtMove: -1
                    }],
                    liberties: liberties.map(
                        liberty => ({ ...liberty, createdAtMove: currentMoveIndex, removedAtMove: -1 })
                    ),
                    createdAtMove: currentMoveIndex,
                    removedAtMove: -1
                };

                turnPlayersGroups
                    .forEach(group => {
                        group.stones.forEach(stoneToBeAdded => {
                            if(
                                !mergedGroup.stones.find(
                                    alreadyExistingStone =>
                                        alreadyExistingStone.row === stoneToBeAdded.row
                                        && alreadyExistingStone.column === stoneToBeAdded.column
                                        && alreadyExistingStone.removedAtMove === -1
                                ) && stoneToBeAdded.removedAtMove === -1
                            ) {
                                mergedGroup.stones.push({
                                    ...stoneToBeAdded,
                                    createdAtMove: currentMoveIndex,
                                    removedAtMove: -1
                                });
                            }
                        });

                        group.liberties.forEach(libertyToBeAdded => {
                            if(
                                !mergedGroup.liberties.find(
                                    alreadyExistingLiberty =>
                                        alreadyExistingLiberty.row === libertyToBeAdded.row
                                        && alreadyExistingLiberty.column === libertyToBeAdded.column
                                        && alreadyExistingLiberty.removedAtMove === -1
                                ) && libertyToBeAdded.removedAtMove === -1
                            ) {
                                mergedGroup.liberties.push({
                                    ...libertyToBeAdded,
                                    createdAtMove: currentMoveIndex,
                                    removedAtMove: -1
                                });
                            }
                        });

                        group.removedAtMove = currentMoveIndex;
                    });

                game.groups.push(mergedGroup);

                // Push to active groups array
                activeGroups.push(game.groups[game.groups.length - 1]);
            }
        } else {
            // Create a new group for turn player
            game.groups.push({
                player: whosTurn,
                stones: [{
                    row,
                    column,
                    createdAtMove: currentMoveIndex,
                    removedAtMove: -1
                }],
                liberties: liberties.map(
                    liberty => ({ ...liberty, createdAtMove: currentMoveIndex, removedAtMove: -1 })
                ),
                createdAtMove: currentMoveIndex,
                removedAtMove: -1
            });

            // Push to active groups array
            activeGroups.push(game.groups[game.groups.length - 1]);
        }

        // If added stone captured liberty points of opponent's groups
        // Check if opponent's groups have other liberties, if not
        // Remove them and add number of captured stones to turn player's score
        if(opponentsGroups.length) {
            // Only and only removed stone
            let theFirstAndOnlyCapturedStone = null;

            opponentsGroups.forEach(group => {
                // Find active liberties of group (the ones that are not removed yet)
                const activeLibertiesOfGroup = group.liberties.filter(
                    liberty => liberty.removedAtMove === -1
                );

                // If opponent's group has no active liberties remove the group and add number of
                // stones captured to turn player's score
                if(!activeLibertiesOfGroup.length) {
                    let numberOfCapturedStones = 0;

                    group.stones.forEach(capturedStone => {
                        // Check if captured stone is was removed (inactive)
                        const isCapturedStoneRemoved = capturedStone.removedAtMove > -1;
                        if(isCapturedStoneRemoved) {
                            return;
                        }

                        // Empty the board position where the removed (captured)
                        // stone was put
                        game.board[capturedStone.row][capturedStone.column] = null;

                        // Set removedAtMove of captured stone
                        capturedStone.removedAtMove = currentMoveIndex;

                        // Increase the number of stones captured by 1
                        numberOfCapturedStones++;

                        // If only and only captured stone was set already and just removed
                        // another stone then previously set value has no possiblity to
                        // create a ko, so we set it back to null
                        if(theFirstAndOnlyCapturedStone) {
                            theFirstAndOnlyCapturedStone = null;
                        } else {
                            theFirstAndOnlyCapturedStone = capturedStone;
                        }

                        // Turn players groups that are surrounding opponent's captured stone
                        const turnPlayersSurroundingGroups = [];

                        // Captured stone's neighboring (capturing) stone positions
                        const neighboringStonePositions = {
                            top: { row: capturedStone.row - 1, column: capturedStone.column },
                            bottom: { row: capturedStone.row + 1, column: capturedStone.column },
                            left: { row: capturedStone.row, column: capturedStone.column - 1 },
                            right: { row: capturedStone.row, column: capturedStone.column + 1 }
                        };

                        // Find turn player's stones that are surrounding captured stone
                        activeGroups.forEach(group => {
                            const isTurnPlayersGroup = group.player === whosTurn;
                
                            if(!isTurnPlayersGroup) {
                                return;
                            }

                            const doesGroupContainAnyNeighboringStones = group.stones.some(
                                stone => {
                                    if(stone.removedAtMove > -1) {
                                        return false;
                                    }

                                    // Check if stone's positions are equal to one of neighboring
                                    // stones' positions. If so, then the group is 
                                    return Object.values(neighboringStonePositions).some(
                                        neighboringStonePosition =>
                                            stone.row === neighboringStonePosition.row
                                            && stone.column === neighboringStonePosition.column
                                    );
                                }
                            );

                            if(doesGroupContainAnyNeighboringStones && !turnPlayersSurroundingGroups.some(existingGroup => existingGroup === group)) {
                                turnPlayersSurroundingGroups.push(group);
                            }
                        });

                        // Add captured stone's positions as a new liberty to turn player's
                        // surrounding (capturing) groups
                        turnPlayersSurroundingGroups.forEach(group => {
                            group.liberties.push({
                                row: capturedStone.row,
                                column: capturedStone.column,
                                createdAtMove: currentMoveIndex,
                                removedAtMove: -1
                            });
                        });
                    });

                    game[whosTurn].score += numberOfCapturedStones;

                    group.removedAtMove = currentMoveIndex;
                }
            });

            // Check if only and only one stone was captured and added stone had no liberties
            // If so, this move creates a ko
            if(theFirstAndOnlyCapturedStone && !liberties.length) {
                const existingKo = game.kos.find(
                    ko => ko.row === theFirstAndOnlyCapturedStone.row && ko.column === theFirstAndOnlyCapturedStone.column
                );

                if(existingKo) {
                    existingKo.allowed = false;
                    existingKo.createdAtMoves.push(currentMoveIndex);
                } else {
                    game.kos.push({
                        row: theFirstAndOnlyCapturedStone.row,
                        column: theFirstAndOnlyCapturedStone.column,
                        allowed: false,
                        createdAtMoves: [currentMoveIndex]
                    });
                }
            }
        }

        game[whosTurn].timeRemaining = turnPlayersCurrentTimeRemaining;

        await game.save();

        const gameDTO = GameDTO.withGameObject(game);

        return gameDTO;
    }

    #calculateLibertyPointsOfGivenPoint(game, row, column, whosTurn) {
        // true for black, false for white stone, null for free position
        // If position is empty but has no liberties, need to check surrounding stones
        // If surrounding stones are opponent's then it's a dead position
        // So don't allow player to put stone there, otherwise allow it

        const liberties = [];
        let suicide = true;

        // Possible liberty point positions (top, bottom, left, right)
        const libertyPointPositions = {
            top: { row: row - 1, column: column },
            bottom: { row: row + 1, column: column },
            left: { row: row, column: column - 1 },
            right: { row: row, column: column + 1 }
        };

        Object.values(libertyPointPositions).forEach(
            libertyPointPosition => {
                const boardValue = game.board[libertyPointPosition.row]?.[libertyPointPosition.column];

                // If position is not null (empty), then it is not a liberty point
                if(boardValue !== null) {
                    if(
                        (whosTurn === 'black' && boardValue === true)
                        || (whosTurn === 'white' && boardValue === false)
                    ) {
                        suicide = false;
                    }

                    return;
                }

                suicide = false;

                liberties.push({
                    row: libertyPointPosition.row,
                    column: libertyPointPosition.column
                });
            }
        );

        return { liberties, suicide };
    }

    #findWhosTurnAndLastMoveAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(username, game) {
        const isBlackPlayer = username === game.black.user.username;
        const isWhitePlayer = username === game.white.user.username;
        const isPlayer = isBlackPlayer || isWhitePlayer;
        const lastMove = game.moves.length
            ? game.moves[game.moves.length - 1]
            : null;

        let whosTurn = 'black';
        if(game.status !== 'waiting' && lastMove?.player === 'black') {
            whosTurn = 'white';
        }

        const isPlayersTurn = (isBlackPlayer && whosTurn === 'black') || (isWhitePlayer && whosTurn === 'white');

        return {
            isBlackPlayer,
            isWhitePlayer,
            isPlayer,
            lastMove,
            whosTurn,
            isPlayersTurn
        };
    }

    #calculateTurnPlayersCurrentTimeRemaining(game, whosTurn, currentMoveAt, lastMove) {
        const lastMoveAt = lastMove ? lastMove.createdAt : null;
        const timeElapsedSinceLastMoveInSeconds = lastMoveAt ? ((currentMoveAt - lastMoveAt) / 1000) : 0;
        const turnPlayersNewTimeRemaining = game[whosTurn].timeRemaining - timeElapsedSinceLastMoveInSeconds;

        return turnPlayersNewTimeRemaining;
    }

    #undoLastMoveOfGame(game) {
        const lastMoveIndex = game.moves.length - 1;
        const lastMove = game.moves[lastMoveIndex];
        const lastMovePlayer = lastMove.player;
        let scoresToBeDecreased = 0;

        // Remove last move from moves
        game.moves.splice(lastMoveIndex, 1);

        // If the move was first move of the game, then set the game's status
        // back to waiting
        if(!game.moves.length) {
            game.status = 'waiting';
        }

        // Update player's time remaining
        const now = new Date();
        const moveBeforeLastMove = game.moves[game.moves.length - 1];

        if(moveBeforeLastMove) {
            const timeElapsedSinceMoveBeforeLastMove = (now - moveBeforeLastMove.createdAt) / 1000;
    
            game[lastMovePlayer].timeRemaining += timeElapsedSinceMoveBeforeLastMove;
        }

        if(lastMove.pass) {
            return game;
        }

        // Empty the board position of last move
        game.board[lastMove.row][lastMove.column] = null;

        // Store last move player's and opponent's groups
        const playersGroups = [];
        const opponentsGroups = [];

        game.groups.forEach(
            group => {
                const isPlayersGroup = group.player === lastMovePlayer;
                const isCreatedAtLastMove = group.createdAtMove === lastMoveIndex;
                const isRemovedAtLastMove = group.removedAtMove === lastMoveIndex;

                // Revert group's (player's or opponent's, doesn't matter)
                // liberties that are removed at last move
                group.liberties.forEach(
                    liberty => {
                        const isLibertyRemovedAtLastMove = liberty.removedAtMove === lastMoveIndex;

                        if(isLibertyRemovedAtLastMove) {
                            liberty.removedAtMove = -1;
                        }
                    }
                );

                if(isPlayersGroup) {
                    // If player's group was created at last move simply skip it
                    // to filter out
                    if(isCreatedAtLastMove) {
                        return;
                    }

                    // Filter out stones and liberties of player's group that are
                    // created/added at last move
                    group.stones = group.stones.filter(
                        stone => stone.createdAtMove !== lastMoveIndex
                    );

                    group.liberties = group.liberties.filter(
                        liberty => liberty.createdAtMove !== lastMoveIndex
                    );

                    // Filter out player's groups that are created at last move
                    playersGroups.push(group);
                } else {
                    // Filter out opponent's groups that are removed at last move
                    // and calculate stones captured at last move to decrement
                    // player's score by the amount of stones captured
                    if(isRemovedAtLastMove) {
                        let capturedStoneCount = 0;
                        
                        group.stones.forEach(
                            stone => {
                                const isStoneRemovedAtLastMove = stone.removedAtMove === lastMoveIndex;

                                if(isStoneRemovedAtLastMove) {
                                    game.board[stone.row][stone.column] = lastMovePlayer !== 'black';

                                    stone.removedAtMove = -1;

                                    capturedStoneCount++;
                                }
                            }
                        );
                        
                        scoresToBeDecreased += capturedStoneCount;
                        
                        group.removedAtMove = -1;
                    }

                    opponentsGroups.push(group);
                }
            }
        );

        // Update groups by merging player's groups and opponent's groups
        game.groups = [].concat(playersGroups, opponentsGroups);

        // Update kos that were created at last move or were allowed at last move
        game.kos.forEach(
            ko => {
                const isKoCreatedAtLastMove = !ko.allowed && ko.createdAtMoves.indexOf(lastMoveIndex) > -1;
                const isKoAllowedAtLastMove = ko.allowed && ko.createdAtMoves.indexOf(lastMoveIndex - 1) > -1;

                if(isKoCreatedAtLastMove) {
                    const createdAtMoveIndex = ko.createdAtMoves.indexOf(lastMoveIndex);
    
                    ko.createdAtMoves.splice(createdAtMoveIndex, 1);
                }

                if(isKoAllowedAtLastMove) {
                    ko.allowed = false;
                }
            }
        );

        // Update player's score
        game[lastMovePlayer].score -= scoresToBeDecreased;

        return game;
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
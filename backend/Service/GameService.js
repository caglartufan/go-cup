const mongoose = require('mongoose');
const GameDAO = require('../DAO/GameDAO');
const UserDAO = require('../DAO/UserDAO');
const UserDTO = require('../DTO/UserDTO');
const { InvalidDTOError, UserNotFoundError, GameNotFoundError, UnauthorizedError, GameHasAlreadyFinishedOrCancelledError, NotYourTurnError } = require('../utils/ErrorHandler');
const GameDTO = require('../DTO/GameDTO');

class GameService {
    queue = [];
    #io = null;
    #processing = false;
    #gameProcessInterval = null;
    #cancelledGamesInterval = null;
    #playerRanOutOfTimeGamesInterval = null;

    constructor(io) {
        this.#io = io;

        this.#cancelledGamesInterval = setInterval(() => {
            this.#cancelGamesThatAreTimedOutOnWaitingStatus();
        }, 1000);

        this.#playerRanOutOfTimeGamesInterval = setInterval(() => {
            this.#finishGamesThatPlayerRanOutOfTime();
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

    async #cancelGamesThatAreTimedOutOnWaitingStatus() {
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

    async #finishGamesThatPlayerRanOutOfTime() {
        const { gameIds, users } = await GameDAO.finishGamesThatPlayerRanOutOfTimeAndReturnGameIdsAndUserIds();
        
        if(gameIds.length && users.length) {
            const gamesWithStatusAndLatestSystemChatEntry = await GameDAO.getGamesWithLatestSystemChatEntryByGameIds(gameIds);

            await UserDAO.nullifyActiveGameOfUsers(...users);

            const sockets = await this.#io.fetchSockets();
            const playerSockets = sockets.filter(
                socket => users.findIndex(
                    user => user.username === socket.data.user?.username
                ) > -1
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
        } = this.#findWhosTurnAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(user, game);

        if(!isPlayer) {
            throw new UnauthorizedError();
        }

        if(!isPlayersTurn) {
            throw new NotYourTurnError();
        }

        const currentMoveAt = new Date();
        const turnPlayersCurrentTimeRemaining = this.#calculateTurnPlayersCurrentTimeRemaining(game, currentMoveAt, lastMove);
        
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
        const { liberties, suicide } = this.#calculateLibertyPointsOfGivenPointForGivenGameBoard(game.board, row, column, whosTurn);

        // Check if stone added captures any of opponent's groups
        const isCapturingAnyOfOpponentsGroups = game.groups.some(group => {
            const isOpponentsGroup = group.player !== whosTurn;

            if(!isOpponentsGroup) {
                return false;
            }

            const libertiesOfGroup = group.liberties.filter(
                liberty => liberty.removedAtMove === -1
            );

            if(libertiesOfGroup.length !== 1) {
                return false;
            }
            
            const isAddedStoneLastLibertyPointOfGroup = libertiesOfGroup[0].row === row && libertiesOfGroup[0].column === column;

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

        // TODO: Simplify Nested Conditional Checks
        // GPT: One possible improvement is to split these conditions into separate variables or
        // functions with descriptive names to make the logic more explicit. This can enhance the
        // readability and maintainability of the code...
        // If position where stone is being added has no liberties and is surrounded
        // by opponent's stones (suicide) then do nothing
        if(!liberties.length && suicide && (!isCapturingAnyOfOpponentsGroups || isNotAllowedDueToKo)) {
            return;
        }

        // Add stone to the poisiton (true for black, false for white stone)
        game.board[row][column] = isBlackPlayer; // true or false

        // Accept the stone added and add move
        game.moves.push({
            player: whosTurn,
            row,
            column,
            createdAt: currentMoveAt
        });

        // Store current move's index to use it in group's createdAtMove, removedAtMove fields
        const currentMoveIndex = game.moves.length - 1;

        // Allow the positions that were disallowed due to a ko
        disallowedKoPositions.forEach(ko => {
            ko.allowed = true;
        });

        const turnPlayersGroupIndexes = [];
        const opponentsGroupIndexes = [];

        // Check if stone is placed at liberty point of existing groups
        game.groups.forEach((group, groupIndex) => {
            const isGroupRemoved = group.removedAtMove > -1;

            if(isGroupRemoved) {
                return;
            }

            const isTurnPlayersGroup = group.player === whosTurn;
            const capturedLibertyIndex = group.liberties.findIndex(
                liberty => liberty.row === row && liberty.column === column && liberty.removedAtMove === -1
            );

            if(capturedLibertyIndex > -1) {
                // Remove the liberty point
                group.liberties[capturedLibertyIndex].removedAtMove = currentMoveIndex;

                if(isTurnPlayersGroup) {
                    turnPlayersGroupIndexes.push(groupIndex);
                } else {
                    opponentsGroupIndexes.push(groupIndex);
                }
            }
        });

        if(turnPlayersGroupIndexes.length) {
            if(turnPlayersGroupIndexes.length === 1) {
                const group = game.groups[turnPlayersGroupIndexes[0]];

                // Add stone to the stones of group
                group.stones.push({
                    row,
                    column,
                    createdAtMove: currentMoveIndex
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

                turnPlayersGroupIndexes
                    .forEach(groupIndex => {
                        const group = game.groups[groupIndex];

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
                                    createdAtMove: currentMoveIndex
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
                                    createdAtMove: currentMoveIndex
                                });
                            }
                        });

                        group.removedAtMove = currentMoveIndex;
                    });

                game.groups.push(mergedGroup);
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
        }

        // If added stone captured liberty points of opponent's groups
        // Check if opponent's groups have other liberties, if not
        // Remove them and add number of captured stones to turn player's score
        if(opponentsGroupIndexes.length) {
            // Only and only removed stone
            let theFirstAndOnlyCapturedStone = null;

            opponentsGroupIndexes.forEach(groupIndex => {
                const group = game.groups[groupIndex];

                // Find active liberties of group (the ones that are not removed yet)
                const activeLibertiesOfGroup = group.liberties.filter(
                    liberty => liberty.removedAtMove === -1
                );

                // If opponent's group has no active liberties remove the group and add number of
                // stones captured to turn player's score
                if(!activeLibertiesOfGroup.length) {
                    let numberOfCapturedStones = 0;

                    group.stones.forEach(capturedStone => {
                        if(capturedStone.removedAtMove > -1) {
                            return;
                        }

                        game.board[capturedStone.row][capturedStone.column] = null;

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
                        const turnPlayersSurroundingGroupIndexes = [];

                        // Captured stone's neighboring (capturing) stones
                        const neighboringStonePositions = {
                            top: { row: capturedStone.row - 1, column: capturedStone.column },
                            bottom: { row: capturedStone.row + 1, column: capturedStone.column },
                            left: { row: capturedStone.row, column: capturedStone.column - 1 },
                            right: { row: capturedStone.row, column: capturedStone.column + 1 }
                        };

                        // Find turn player's stones that are surrounding captured stone
                        game.groups.forEach((group, groupIndex) => {
                            const isGroupRemoved = group.removedAtMove > -1;
                            const isTurnPlayersGroup = group.player === whosTurn;
                
                            if(isGroupRemoved || !isTurnPlayersGroup) {
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

                            if(doesGroupContainAnyNeighboringStones && turnPlayersSurroundingGroupIndexes.indexOf(groupIndex) === -1) {
                                turnPlayersSurroundingGroupIndexes.push(groupIndex);
                            }
                        });

                        // Add captured stone's positions as a new liberty to turn player's
                        // surrounding (capturing) groups
                        turnPlayersSurroundingGroupIndexes.forEach(groupIndex => {
                            const group = game.groups[groupIndex];

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

        game[whosTurn].timeRemaining = playerNewTimeRemaining;

        await game.save();

        const gameDTO = GameDTO.withGameObject(game);

        return gameDTO;
    }

    #calculateLibertyPointsOfGivenPointForGivenGameBoard(board, row, column, whosTurn) {
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
                const boardValue = board[libertyPointPosition.row] && board[libertyPointPosition.row][libertyPointPosition.column];

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

    #findWhosTurnAndCheckIfGivenUserIsPlayerOfGameAndTheirTurn(user, game) {
        const isBlackPlayer = user.username === game.black.user.username;
        const isWhitePlayer = user.username === game.white.user.username;
        const isPlayer = isBlackPlayer || isWhitePlayer;
        const lastMove = game.moves.length
            ? game.moves[game.moves.length - 1]
            : null;

        let whosTurn = 'black';
        if(game.status !== 'waiting' && lastMove.player === 'black') {
            whosTurn = 'white';
        }

        const isPlayersTurn = (isBlackPlayer && whosTurn === 'white') || (isWhitePlayer && whosTurn === 'black');

        return {
            isPlayer,
            lastMove,
            whosTurn,
            isPlayersTurn
        };
    }

    #calculateTurnPlayersCurrentTimeRemaining(game, currentMoveAt, lastMove) {
        const lastMoveAt = lastMove ? lastMove.createdAt : null;
        const timeElapsedSinceLastMoveInSeconds = lastMoveAt ? ((currentMoveAt - lastMoveAt) / 1000) : 0;
        const turnPlayersNewTimeRemaining = game[whosTurn].timeRemaining - timeElapsedSinceLastMoveInSeconds;

        return turnPlayersNewTimeRemaining;
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
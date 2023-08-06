const { ErrorHandler, UnauthorizedError } = require('../utils/ErrorHandler');

module.exports = {
    onConnection: async (services, socket) => {
        console.log(socket.id, socket.rooms, socket.handshake.auth.token, socket.data.user?.username);
        if(socket.data.user) {
			try {
				await services.userService.setUserOnline(socket.data.user);

				const gameIdsOfSocket = await services.userService.getGamesOfUser(socket.data.user);
				if(gameIdsOfSocket.length) {
					const gameRoomsOfSocket = gameIdsOfSocket.map(gameId => ('game-' + gameId));
					socket.in(gameRoomsOfSocket).emit('playerOnlineStatus', socket.data.user.username, true);
				}
			} catch(error) {
				socket.emit('errorOccured', ErrorHandler.handle(error).message);
			}
        }
    },
	onDisconnecting: async (io, socket) => {
		const socketName = socket.data.user
			? socket.data.user.username
			: socket.id;
		const socketGameRooms = Array.from(socket.rooms).filter(roomName => roomName.startsWith('game-'));

		for(const gameRoom of socketGameRooms) {
			const roomSockets = await io.in(gameRoom).fetchSockets();
	
			io.in(gameRoom).emit('userLeftGameRoom', socketName, roomSockets.length);
		}
	},
	onDisconnect: async (services, socket) => {
		if(socket.data.user) {
			await services.userService.setUserOffline(socket.data.user);

			const gameIdsOfSocket = await services.userService.getGamesOfUser(socket.data.user);
			if(gameIdsOfSocket.length) {
				const gameRoomsOfSocket = gameIdsOfSocket.map(gameId => ('game-' + gameId));
				socket.in(gameRoomsOfSocket).emit('playerOnlineStatus', socket.data.user.username, false);
			}
		}

	},
    onAuthenticated: async (services, socket, token) => {
		socket.handshake.auth.token = token;

		try {
			const userDTO = await services.userService.authenticate(token);
			socket.data.user = userDTO;

			services.userService.setUserOnline(socket.data.user);

			const gameIdsOfSocket = await services.userService.getGamesOfUser(socket.data.user);
			if(gameIdsOfSocket.length) {
				const gameRoomsOfSocket = gameIdsOfSocket.map(gameId => ('game-' + gameId));
				socket.in(gameRoomsOfSocket).emit('playerOnlineStatus', socket.data.user.username, true);
			}

			socket.join(userDTO.username);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
    onLoggedOut: async (io, services, socket) => {
		// TODO: On log out or on disconnection, set a timeout that will
		// dequeue user if user is already in queue
		if(socket.data.user && socket.handshake.auth.token) {
			await services.userService.setUserOffline(socket.data.user);

			const gameIdsOfSocket = await services.userService.getGamesOfUser(socket.data.user);
			if(gameIdsOfSocket.length) {
				const gameRoomsOfSocket = gameIdsOfSocket.map(gameId => ('game-' + gameId));
				socket.in(gameRoomsOfSocket).emit('playerOnlineStatus', socket.data.user.username, false);
			}
			
			const socketGameRooms = Array.from(socket.rooms).filter(roomName => roomName.startsWith('game-'));
			for(let gameRoom of socketGameRooms) {
				const roomSockets = await io.in(gameRoom).fetchSockets();
		
				io.in(gameRoom).emit('userLeftGameRoom', socket.data.user.username, roomSockets.length);
			}
	
			delete socket.handshake.auth.token;
			delete socket.data.user;
		}
	},
	onPlay: (io, services, socket, preferences) => {
		const gameService = services.gameService;

		gameService.enqueue(socket.data.user, preferences);

		const inQueue = gameService.queue.length;

		socket.join('queue');

		socket.emit('searching', {
			inQueue
		});

		io.in('queue').emit('queueUpdated', {
			inQueue
		});
	},
	onFetchQueueData: (services, socket, callback) => {
		const inQueue = services.gameService.queue.length;
		const timeElapsed = services.gameService.timeElapsedOfUser(socket.data.user.username);

		callback({ inQueue, timeElapsed });
	},
	onCancel: (io, services, socket) => {
		const gameService = services.gameService;
		
		gameService.dequeue(socket.data.user);

		const inQueue = gameService.queue.length;

		socket.leave('queue');

		socket.emit('cancelled');

		io.in('queue').emit('queueUpdated', {
			inQueue
		});
	},
	onJoinGameRoom: async (io, socket, gameId) => {
		const socketName = socket.data.user
			? socket.data.user.username
			: socket.id;
		const gameRoom = 'game-' + gameId;

		socket.join(gameRoom);

		const roomSockets = await io.in(gameRoom).fetchSockets();

		io.in(gameRoom).emit('userJoinedGameRoom', socketName, roomSockets.length);
	},
	onLeaveGameRoom: async (io, socket, gameId) => {
		const socketName = socket.data.user
			? socket.data.user.username
			: socket.id;
		const gameRoom = 'game-' + gameId;

		socket.leave(gameRoom);

		const roomSockets = await io.in(gameRoom).fetchSockets();

		io.in(gameRoom).emit('userLeftGameRoom', socketName, roomSockets.length);
	},
	onGameChatMessage: async (io, services, socket, gameId, message) => {
		try {
			const userId = await services.userService.getUserIdByUser(socket.data.user);

			const chatEntry = await services.gameService.createChatEntryByGameId(gameId, userId, message);

			io.in('game-' + gameId).emit('gameChatMessage', chatEntry);
		} catch(error) {
			socket.emit('errorOccured', error.message);
		}
	},
	onCancelGame: async (io, services, socket, gameId) => {
		try {
			const cancelGameResult = await services.gameService.cancelGame(gameId, socket.data.user.username);

			if(cancelGameResult.cancelledBy && cancelGameResult.latestSystemChatEntry) {
				io.in('game-' + gameId).emit('gameCancelled', gameId, cancelGameResult.cancelledBy);
				io.in('game-' + gameId).emit('gameChatMessage', cancelGameResult.latestSystemChatEntry);
			}
		} catch(error) {
			socket.emit('errorOccured', error.message);
		}
	},
	onResignFromGame: async (io, services, socket, gameId) => {
		try {
			const resignedGameResult = await services.gameService.resignFromGame(gameId, socket.data.user.username);

			if(!resignedGameResult.resignedPlayer || !resignedGameResult.latestSystemChatEntry) {
				return;
			}

			io.in('game-' + gameId).emit('playerResignedFromGame', gameId, resignedGameResult.resignedPlayer);
			io.in('game-' + gameId).emit('gameChatMessage', resignedGameResult.latestSystemChatEntry);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onRequestUndo: async (io, services, socket, gameId) => {
		try {
			const undoRequestedGameResult = await services.gameService.requestUndo(gameId, socket.data.user.username);

			if(!undoRequestedGameResult.requestedBy || !undoRequestedGameResult.game) {
				return;
			}

			const { requestedBy, game } = undoRequestedGameResult;

			io.in('game-' + gameId).emit('undoRequested', requestedBy, game.black, game.white, game.undo);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onRejectUndoRequest: async (io, services, socket, gameId) => {
		try {
			const requestedBy = await services.gameService.rejectUndoRequest(gameId, socket.data.user.username);

			io.in('game-' + gameId).emit('undoRequestRejected', requestedBy);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onAcceptUndoRequest: async (io, services, socket, gameId) => {
		try {
			const { requestedBy, game } = await services.gameService.acceptUndoRequest(gameId, socket.data.user.username);

			io.in('game-' + gameId).emit('undoRequestAccepted', requestedBy, game.status, game.board, game.moves, game.black, game.white);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onPass: async (io, services, socket, gameId) => {
		try {
			const game = await services.gameService.pass(gameId, socket.data.user.username);

			io.in('game-' + gameId).emit('passed', game.status, game.moves, game.groups, game.emptyGroups, game.black, game.white);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onCancelFinishing: async (io, services, socket, gameId) => {
		try {
			const game = await services.gameService.cancelFinishing(gameId, socket.data.user.username);

			io.in('game-' + gameId).emit('cancelledFinishing', game.status, game.black, game.white);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
	onConfirmFinishing: async (io, services, socket, gameId) => {
		
	},
	onAddStone: async (io, services, socket, gameId, row, column) => {
		if(gameId !== socket.data.user.activeGame.toString()) {
			return;
		}

		try {
			const updatedGame = await services.gameService.addStoneToTheGame(socket.data.user, gameId, row, column);

			if(!updatedGame) {
				return;
			}
			
			io.in('game-' + gameId).emit(
				'addedStone',
				updatedGame.status,
				updatedGame.black,
				updatedGame.white,
				updatedGame.board,
				updatedGame.moves
			);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	}
};
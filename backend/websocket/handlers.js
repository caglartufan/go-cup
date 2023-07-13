const { ErrorHandler, UnauthorizedError } = require('../utils/ErrorHandler');

module.exports = {
    onConnection: socket => {
        console.log(socket.id, socket.rooms, socket.handshake.auth.token, socket.data);
        if(socket.data.user) {
            console.log('User:', socket.data.user.toObject());
        }
    },
    onAuthenticated: async (services, socket, token) => {
		socket.handshake.auth.token = token;

		try {
			const userDTO = await services.userService.authenticate(token);
			socket.data.user = userDTO;

			socket.join(userDTO.username);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
    onLoggedOut: socket => {
		// TODO: On log out or on disconnection, set a timeout that will
		// dequeue user if user is already in queue
		socket.leave(socket.data.user.username);

		delete socket.handshake.auth.token;
		delete socket.data.user;
	},
	onPlay: (io, services, socket, preferences) => {
		// TODO: Add authentication validation to play, cancel, fetchQueueData
		// and other authentication required listeners and return error if user is not
		// authenticated. Preferably, find a way to implement such middleware to
		// specified listeners
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

		socket.emit('cancelled');

		io.in('queue').emit('queueUpdated', {
			inQueue
		});
	},
	onJoinGameRoom: (socket, gameId) => {
		socket.join('game-' + gameId);

		// TODO: Add online/offline visibility in GameDetail page for PlayerCards, if the joined user is
		// black or white player of the game set user as online or other ways to implement this
		// 1) Add "online" proeprty in User model, set it true/false when socket connects/disconnects
		// but how can I emit this to only sockets that are viewing that user??
		// 2) Or maybe "socketId" proeprty can be added to User model and when user connects to websocket
		// server, I can emit  user's active game room (last and playing game in user.games) that "userOnline"
		// event or smh
		if(socket.data.user) {
			socket.in('game-' + gameId).emit('userJoinedGameRoom', socket.data.user.username);
		}
	},
	onGameChatMessage: async (io, services, socket, gameId, message) => {
		if(!socket.data.user) {
			socket.emit('errorOccured', new UnauthorizedError().message);
			return;
		}

		try {
			const userId = await services.userService.getUserIdByUser(socket.data.user);

			const chatEntry = await services.gameService.createChatEntryByGameId(gameId, userId, message);

			io.in('game-' + gameId).emit('gameChatMessage', chatEntry);
		} catch(error) {
			socket.emit('errorOccured', error.message);
		}
	},
	onCancelGame: async () => {
		
	}
};
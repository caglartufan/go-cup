const { ErrorHandler } = require('../utils/ErrorHandler');

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
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	},
    onLoggedOut: socket => {
		delete socket.handshake.auth.token;
		delete socket.data.user;
	},
	onPlay: (services, socket, preferences) => {
		services.gameService.enqueue(socket.data.user, preferences);

		socket.emit('searching', {
			inQueue: services.gameService.queue.length
		});
	},
	onFetchQueueData: (services, socket, callback) => {
		const inQueue = services.gameService.queue.length;
		const timeElapsed = services.gameService.timeElapsedOfUser(socket.data.user.username);
		callback({ inQueue, timeElapsed });
	}
};
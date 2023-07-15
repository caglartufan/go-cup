const { ErrorHandler, UnauthorizedError } = require('../utils/ErrorHandler');

exports.auth = async (services, socket, next) => {
	const token = socket.handshake.auth.token;

	if(token) {
		// TODO: If JWT expires and this gets caught here, find user and set user offline, if user was online
		// Or add some kind of latestActivity field on User model and create an interval process in userService
		// which will set users who were online but latest activity was at least 30 minutes before etc.
		try {
			const userDTO = await services.userService.authenticate(token);
			socket.data.user = userDTO;
			
			socket.join(userDTO.username);
		} catch(error) {
			socket.emit('errorOccured', ErrorHandler.handle(error).message);
		}
	}

	next();
};

exports.forceAuth = (disallowedEvents, socket) => {
	return ([event, ...args], next) => {
		if(!socket.data.user && !socket.handshake.auth.token && disallowedEvents.indexOf(event) > -1) {
			socket.emit('errorOccured', new UnauthorizedError().message);
			return;
		}

		next();
	}
};
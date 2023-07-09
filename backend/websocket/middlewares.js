const { ErrorHandler } = require('../utils/ErrorHandler');

exports.auth = async (services, socket, next) => {
	const token = socket.handshake.auth.token;

	if(token) {
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
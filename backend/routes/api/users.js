const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');
const auth = require('../../middlewares/auth');
const UserDTO = require('../../DTO/UserDTO');

/* GET users listing. */
router.get('/me', auth, function (req, res, next) {
	try {
		const userDTO = UserDTO.withUserObject(req.user);

		const gameService = req.app.get('services').gameService;
		const isUserInQueue = gameService.isUserInQueue(userDTO.username);
		userDTO.isInQueue = isUserInQueue;

		return res.json({
			ok: true,
			user: userDTO.toObject()
		});
	} catch(error) {
		next(ErrorHandler.handle(error));
	}
});

module.exports = router;
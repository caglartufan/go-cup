const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');
const auth = require('../../middlewares/auth');
const UserDTO = require('../../DTO/UserDTO');
const UserDAO = require('../../DAO/UserDAO');

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

router.get('/leaderboard', async function(req, res) {
	const leaderboard = await UserDAO.getTopEloPlayers();

	const leaderboardMapped = leaderboard.map(
		user => UserDTO.withUserObject(user).toObject()
	);

	return res.json({
		ok: true,
		leaderboard: leaderboardMapped
	});
});

module.exports = router;
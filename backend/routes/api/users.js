const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');
const auth = require('../../middlewares/auth');
const UserDTO = require('../../DTO/UserDTO');
const UserDAO = require('../../DAO/UserDAO');
const GameDTO = require('../../DTO/GameDTO');

/* GET users listing. */
router.get('/me', auth, function(req, res, next) {
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

router.get('/me/games', auth, async function(req, res, next) {
	try {
		const userDTO = UserDTO.withUserObject(req.user);

		const userService = req.app.get('services').userService;
		const games = await userService.getGamesOfUser(userDTO, true);

		const gamesMapped = games.map(
			game => GameDTO.withGameObject(game).toObject()
		);

		return res.json({
			ok: true,
			games: gamesMapped,
			total: gamesMapped.length
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
const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { ErrorHandler } = require('../../utils/ErrorHandler');
const UserDTO = require('../../DTO/UserDTO');

router.get('/', async function(req, res) {
    // TODO: Add pagination, filter and search with UI
    const games = await req.app.get('services').gameService.getGames();

    return res.json({
        total: games.length,
        games
    });
});

router.post('/play', auth, function(req, res, next) {
    const reqData = req.body;

    const preferences = {
        size: reqData.size
    };

    try {
        const user = UserDTO.withUserObject(req.user);

        req.app.get('services').gameService.enqueue(user, preferences);

        return res.json({
            ok: true
        });
    } catch(error) {
        next(ErrorHandler.handle(error));
    }
});

router.delete('/cancel', auth, function(req, res, next) {
    try {
        const user = UserDTO.withUserObject(req.user);

        req.app.get('services').gameService.dequeue(user);

        return res.json({
            ok: true
        });
    } catch(error) {
        next(ErrorHandler.handle(error));
    }
});

router.get('/queue', function(req, res) {
    return res.json({
        queue: req.app.get('services').gameService.getQueue()
    });
});



module.exports = router;
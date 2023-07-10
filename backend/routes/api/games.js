const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');

router.get('/', async function(req, res) {
    // TODO: Add pagination, filter and search with UI
    const gameDTOs = await req.app.get('services').gameService.getGames();

    const serializedGameDTOs = gameDTOs.map(gameDTO => gameDTO.toObject());

    return res.json({
        ok: true,
        total: gameDTOs.length,
        games: serializedGameDTOs
    });
});

router.get('/:gameId', async function(req, res, next) {
    const gameId = req.params.gameId;

    try {
        const gameDTO = await req.app.get('services').gameService.findGameById(gameId);

        return res.json({
            ok: true,
            game: gameDTO.toObject()
        });
    } catch(error) {
        next(ErrorHandler.handle(error));
    }
});

router.get('/queue', function(req, res) {
    return res.json({
        ok: true,
        queue: req.app.get('services').gameService.getQueue()
    });
});



module.exports = router;
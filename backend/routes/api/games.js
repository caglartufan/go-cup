const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');

router.get('/', async function(req, res) {
    const {
        page,
        size: sizeFilter,
        'elo-range': eloRangeFilter,
        'started-at-order': startedAtOrder
    } = req.query;

    const { total, gameDTOs } = await req.app.get('services').gameService.getGames(page, sizeFilter, eloRangeFilter, startedAtOrder);

    const serializedGameDTOs = gameDTOs.map(gameDTO => gameDTO.toObject());

    return res.json({
        ok: true,
        total: total,
        games: serializedGameDTOs,
        totalPages: Math.ceil(total / 6)
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

// TODO: Remove this end point and related service methods
router.get('/queue', function(req, res) {
    return res.json({
        ok: true,
        queue: req.app.get('services').gameService.getQueue()
    });
});



module.exports = router;
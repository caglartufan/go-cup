const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
    // TODO: Add pagination, filter and search with UI
    const games = await req.services.gameService.getGames();

    return res.json({
        total: games.length,
        games
    });
});

router.post('/start', async function(req, res, next) {

});



module.exports = router;
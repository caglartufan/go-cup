const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
    const games = await req.services.gameService.getGames();

    return res.json({
        size: games.length,
        games
    });
});



module.exports = router;
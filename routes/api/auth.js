const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../../models/user');

router.post('/signup', async function(req, res, next) {
    const reqData = req.body;

    try {
        const user = new User(reqData);
    
        await user.save();
    
        res
            .status(201)
            .json({
                user
            });
    } catch(error) {
        if(error instanceof mongoose.Error.ValidationError) {
            res
                .status(400)
                .json(); // @@@
        }
    }
});

router.post('/login', function(req, res, next) {
    res.send('log in');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../../models/user');

router.post('/signup', async function(req, res, next) {
    const reqData = req.body;

    try {
        // Validate request data with joi and check if there's existing user with given username or email
        const user = new User(reqData);
    
        await user.save();

        const token = user.generateAuthToken();
    
        res
            .status(201)
            .json({
                user,
                token
            });
    } catch(error) {
        if(error instanceof mongoose.Error.ValidationError) {
            const errors = error.errors;
            console.log(errors);
            for(let errorPath of Object.keys(errors)) {
                errors[errorPath] = errors[errorPath].message;
            }

            res
                .status(400)
                .json({
                    message: error._message,
                    errors: errors
                });
        } else {
            console.log(error);
            res
                .status(500)
                .json({
                    message: error.message
                });
        }
    }
});

router.post('/login', function(req, res, next) {
    res.send('log in');
});

module.exports = router;
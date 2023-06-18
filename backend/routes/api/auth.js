const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const _ = require('lodash');

const UserDTO = require('../../DTO/UserDTO');

router.post('/signup', async function(req, res, next) {
    const reqData = req.body;

    const userDTO = UserDTO.withRequestData(reqData);

    try {
        const user = await req.services.userService.signupUser(userDTO);

        const token = user.generateAuthToken();
        
        // TODO modell yerine dto kullan
        return res
            .status(201)
            .header('Authorization', 'Bearer ' + token)
            .json({
                user: _.omit(user.toObject(), 'password')
            });
    } catch(error) {
        next(
            createError(error.status || 500, error.message, { errors: error.errors })
        );
    }
});

router.post('/login', async function(req, res, next) {
    const reqData = req.body;

    const userDTO = UserDTO.withRequestData(reqData);

    try {
        const user = await req.services.userService.loginUser(userDTO);

        const token = user.generateAuthToken();

        return res
            .header('Authorization', 'Bearer ' + token)
            .json({
                user: _.omit(user.toObject(), 'password')
            });
    } catch(error) {
        next(
            createError(error.status || 500, error.message, { errors: error.errors })
        );
    }
});

module.exports = router;
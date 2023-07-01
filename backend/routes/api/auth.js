const express = require('express');
const router = express.Router();
const UserDTO = require('../../DTO/UserDTO');
const { ErrorHandler } = require('../../utils/ErrorHandler');

router.post('/signup', async function(req, res, next) {
    const reqData = req.body;

    let userDTO = UserDTO.withRequestData(reqData);

    try {
        const user = await req.app.get('services').userService.signupUser(userDTO);

        const token = user.generateAuthToken();

        userDTO = UserDTO.withUserObject(user);
        
        return res
            .status(201)
            .header('Authorization', 'Bearer ' + token)
            .json({
                ok: true,
                user: userDTO.toObject()
            });
    } catch(error) {
        next(ErrorHandler.handle(error));
    }
});

router.post('/login', async function(req, res, next) {
    const reqData = req.body;

    let userDTO = UserDTO.withRequestData(reqData);

    try {
        const user = await req.app.get('services').userService.loginUser(userDTO);

        const token = user.generateAuthToken();

        userDTO = UserDTO.withUserObject(user);

        return res
            .header('Authorization', 'Bearer ' + token)
            .json({
                ok: true,
                user: userDTO.toObject()
            });
    } catch(error) {
        next(ErrorHandler.handle(error));
    }
});

module.exports = router;
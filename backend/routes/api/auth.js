const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const _ = require('lodash');

const { User } = require('../../models/user');
const {
    createJoiErrorsObject,
    createMongooseValidationErrorsObject,
    validateSignupData,
    validateLoginData
} = require('../../helpers/validation');

router.post('/signup', async function(req, res, next) {
    const reqData = req.body;

    try {
        const { error } = validateSignupData(reqData);

        if(error) {
            const errors = createJoiErrorsObject(error);

            return next(
                createError(400, 'User data validation failed!', { errors })
            );
        }

        const alreadyExistingUser = await User.findOne({
            $or: [
                { username: reqData.username },
                { email: reqData.email }
            ]
        });

        if(alreadyExistingUser) {
            let errorMessage = '';

            if(alreadyExistingUser.username === reqData.username && alreadyExistingUser.email === reqData.email) {
                errorMessage = 'User name and e-mail address are already in use.';
            } else if(alreadyExistingUser.username === reqData.username) {
                errorMessage = 'User name is already in use.'
            } else if(alreadyExistingUser.email === reqData.email) {
                errorMessage = 'E-mail address is already in use.'
            } else {
                errorMessage = 'User name or e-mail address already in use.'
            }

            return next(createError(400, errorMessage));
        }

        const user = new User(reqData);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    
        await user.save();

        const token = user.generateAuthToken();
    
        return res
            .status(201)
            .header('Authorization', 'Bearer ' + token)
            .json({
                user: _.omit(user.toObject(), 'password')
            });
    } catch(error) {
        if(error instanceof mongoose.Error.ValidationError) {
            const errors = createMongooseValidationErrorsObject(error);

            return next(
                createError(400, error._message, { errors })
            );
        } else {
            return next(error);
        }
    }
});

router.post('/login', async function(req, res, next) {
    const reqData = req.body;

    try {
        const { error } = validateLoginData(reqData);

        if(error) {
            const errors = createJoiErrorsObject(error);

            return next(
                createError(401, 'Log in data validation failed.', { errors })
            );
        }

        const user = await User.findOne({
            $or: [
                { username: reqData.login },
                { email: reqData.login }
            ]
        });

        if(!user) {
            return next(createError(401, 'Invalid user credentials'));
        }

        const isEnteredPasswordValid = await bcrypt.compare(reqData.password, user.password);
        if(!isEnteredPasswordValid) {
            return next(createError(401, 'Invalid user credentials'));
        }

        const token = user.generateAuthToken();

        return res
            .header('Authorization', 'Bearer ' + token)
            .json({
                user: _.omit(user.toObject(), 'password')
            });
    } catch(error) {
        return next(error);
    }
});

module.exports = router;
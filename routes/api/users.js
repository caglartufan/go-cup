const express = require('express');
const router = express.Router();
const debug = require('debug')('go-cup:users');

/* GET users listing. */
router.get('/', function (req, res, next) {
	debug('request');
	res.send('respond with a resource!!!');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const debug = require('debug')('go-cup:anan');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express xd' });
});

module.exports = router;
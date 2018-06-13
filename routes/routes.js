const express = require('express');
const router = express.Router();
const authorization = require('../controllers/authorization');
const user = require('../controllers/user');

// router.all('*', authorization.authorize);
router.post('/user/update', user.update);
router.post('/user/avatar', user.setAvatar);

module.exports = router;
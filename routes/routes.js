const express = require('express');
const router = express.Router();
const authorization = require('../controllers/authorization');
const user = require('../controllers/user');

// router.all('*', authorization.authorize);
router.get('/user/avatar', user.getAvatar);
router.get('/user/info', user.getInfo); //slogan + public name combined

router.put('/user/publicname', user.setPublicName);
router.put('/user/slogan', user.setSlogan);
router.put('/user/avatar', user.setAvatar);

module.exports = router;
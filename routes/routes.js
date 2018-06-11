const express = require('express');
const router = express.Router();
const authorization = require('../controllers/authorization');

router.get('/authorize', authorization.authorize);

module.exports = router;
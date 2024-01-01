const express = require('express');

const { depositBalance } = require('../controller/profile');

const profileRoutes = express.Router();

profileRoutes.post('/deposit/:userId', depositBalance);

module.exports = profileRoutes;

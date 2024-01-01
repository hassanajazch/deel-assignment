const express = require('express');
const { getHighestEarningProfession } = require('../controller/admin');

const adminRouter = express.Router();

adminRouter.get('/best-profession', getHighestEarningProfession);

module.exports = adminRouter;

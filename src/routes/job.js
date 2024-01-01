const express = require('express');

const { getUnpaidJobs, payJobContractor } = require('../controller/job');
const { getProfile } = require('../middleware/getProfile');

const jobRoutes = express.Router();

jobRoutes.get('/unpaid', getProfile, getUnpaidJobs, );
jobRoutes.post('/:jobId/pay', getProfile, payJobContractor);

module.exports = jobRoutes;
    
const express = require('express');

const { getContractById, getNonTerminatedContracts } = require('../controller/contract');
const { getProfile } = require('../middleware/getProfile');

const contractRouter = express.Router();

contractRouter.get('/:id', getProfile, getContractById);
contractRouter.get('/', getProfile, getNonTerminatedContracts);

module.exports = contractRouter;

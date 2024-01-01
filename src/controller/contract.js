const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const { UNEXPECTED_ERR_MESSAGE } = require('../constants/constants')

const getContractById = async (req, res) => {
    try {
        const { Contract } = req.app.get('models');
        // get profileId to check to check contract is associated with profile
        const profileId = req.profile.id;
    
        const contract = await Contract.findOne({
          where: {
            id: req.params.id,
            [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
          },
        });
    
        if(contract) {
            res.status(StatusCodes.OK).json(contract)
        } else {
            res.sendStatus(StatusCodes.NOT_FOUND)
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err})
    }
};

const getNonTerminatedContracts = async (req, res) => {
    try {
        const { Contract } = req.app.get('models');
        // get profileId to check to check contract is associated with profile
        const profileId = req.profile.id;
    
        const contractsList = await Contract.findAll({
          where: {
            status: {
                [Op.not]: 'terminated'
            },
            [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
          },
        });
    
        if(contractsList.length > 0) {
            res.status(StatusCodes.OK).json(contractsList)
        } else {
            res.sendStatus(StatusCodes.NOT_FOUND)
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err})
    }
}

module.exports = {
    getContractById,
    getNonTerminatedContracts,
};
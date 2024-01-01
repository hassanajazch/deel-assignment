const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const { UNEXPECTED_ERR_MESSAGE } = require('../constants/constants');

const getUnpaidJobs = async (req, res) => {
    try {
        const { Job, Contract } = req.app.get('models');
        const profileId = req.profile.id;

        const unpaidJobs = await Job.findAll({
            include: [
                {
                  attributes: [],
                  model: Contract,
                  required: true,
                  where: {
                    [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
                    status: { [Op.eq]: 'in_progress' },
                  },
                },
              ],
              where: {
                [Op.or]: [
                  { paid: false },
                  { paid: null },
                ],
              },
          });

        res.status(StatusCodes.OK).json(unpaidJobs);
          
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err});
    }
};

const payJobContractor = async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models');
    const { id, balance, type } = req.profile;
    const jobId = req.params.jobId;
    const sequelize = req.app.get('sequelize');

    // find job
    const job = await Job.findOne({
        where: { id: jobId, paid: { [Op.is]: null } },
        include: [
          {
            model: Contract,
            where: { status: 'in_progress', ClientId: id },
          },
        ],
      });

      if(job && type === 'client') {
        const pendingPaymentAmount = job.price;
        const contractorId = job.Contract.ContractorId;
        if (balance >= pendingPaymentAmount) {
            // transaction for rollback
            const clientPaymentTrasc = await sequelize.transaction();
           
            try {
                await Promise.all([
                  Profile.update(
                    { balance: sequelize.literal(`balance - ${pendingPaymentAmount}`) },
                    { where: { id } },
                    { transaction: clientPaymentTrasc },
                  ),
      
                  Profile.update(
                    { balance: sequelize.literal(`balance + ${pendingPaymentAmount}`) },
                    { where: { id: contractorId } },
                    { transaction: clientPaymentTrasc },
                  ),
      
                  Job.update(
                    { paid: 1 },
                    { where: { id: jobId } },
                    { transaction: clientPaymentTrasc },
                  ),
                ]);
      
                await clientPaymentTrasc.commit();
      
                return res.status(StatusCodes.OK).json({msg: 'Payment has been transfered successfully'});
            } catch (error) {
                await clientPaymentTrasc.rollback();
      
                return res.status(StatusCodes.CONFLICT).json({msg: 'Unable to proocess the complete the payment process'});
            }
        } else {
            return res.status(StatusCodes.CONFLICT).json({msg: 'Client does not have enough balance to pay for this job'});
        }
    } else {
        return res.status(StatusCodes.NOT_FOUND).json({msg: 'No Unpaid job found for this ID'});
    }
    
}

module.exports = {
    getUnpaidJobs,
    payJobContractor,
};
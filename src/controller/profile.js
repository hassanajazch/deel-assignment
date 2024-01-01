const { StatusCodes } = require('http-status-codes');
const { 
    UNEXPECTED_ERR_MESSAGE, 
    DEPOIST_AMOUNT_LIMIT_ISSUE,
    DEPOIST_AMOUNT_SUCCESS,
} = require('../constants/constants')

const depositBalance = async (req, res) => {
    try {
        const clientId = req.params.userId;
        const depositAmount = req.body.amount;
        const { Job, Contract, Profile } = req.app.get('models');
        const sequelize = req.app.get('sequelize');
        const client = await Profile.findOne({ where: { id: clientId }});

        try {
            const paymentForAllJobs = await Job.findAll(
                {
                  attributes: {
                    include: [[sequelize.fn('SUM', sequelize.col('price')), 'totalPrice']],
                  },
                  include: [
                    {
                      attributes: [],
                      model: Contract,
                      required: true,
                      where: { ClientId: clientId, status: 'in_progress',
                      },
                    },
                  ],
                  where: {
                    paid: null,
                  },
                },
              );
                    
            const { totalPrice } = paymentForAllJobs[0].dataValues;
            if(totalPrice) {
                const depositLimit = totalPrice * 0.25;
                if (depositAmount < depositLimit) {
                    await client.increment({ balance: depositAmount })

                    return res.status(StatusCodes.OK).json({msg: DEPOIST_AMOUNT_SUCCESS});
                } else {
                    return res.status(StatusCodes.CONFLICT).json({msg: DEPOIST_AMOUNT_LIMIT_ISSUE});
                }
            }
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err});
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err})
    }
};

module.exports = {
    depositBalance,
};
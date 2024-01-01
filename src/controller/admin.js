const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const { 
  UNEXPECTED_ERR_MESSAGE,
  BEST_PROFESSION_FAILURE_MESSAGE,
 } = require('../constants/constants');

const getHighestEarningProfession = async (req, res) => {
    try {
        const { Job, Contract, Profile } = req.app.get('models');
        const { startDate, endDate } = req.query;
        const sequelize = req.app.get('sequelize');

        const highestEarningPorfession = await Profile.findAll({
            attributes: ['profession', [sequelize.fn('SUM', sequelize.col('price')), 'earned']],
            include: [
              {
                model: Contract,
                as: 'Contractor',
                attributes: [],
                required: true,
                include: [
                  {
                    model: Job,
                    required: true,
                    attributes: [],
                    where: {
                      paid: true,
                      paymentDate: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate,
                      },
                    },
                  },
                ],
              },
            ],
            where: {
              type: 'contractor',
            },
            group: ['profession'],
            order: [[sequelize.col('earned'), 'DESC']],
            limit: 1,
            subQuery: false,
          });
          
          if(highestEarningPorfession[0]) {
            res.status(StatusCodes.OK).json({bestProfession: highestEarningPorfession[0]});
          } else {
            res.status(StatusCodes.NOT_FOUND).json({msg: BEST_PROFESSION_FAILURE_MESSAGE});
          }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: UNEXPECTED_ERR_MESSAGE, error: err});
    }
};

module.exports = {
    getHighestEarningProfession,
};
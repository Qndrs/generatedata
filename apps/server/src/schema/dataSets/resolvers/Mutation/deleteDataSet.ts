import type { MutationResolvers } from './../../../types.generated';
import { db, sequelize } from '../../../../database';
import * as authUtils from '../../../../utils/authUtils';

export const deleteDataSet: NonNullable<MutationResolvers['deleteDataSet']> = async (_parent, { dataSetId }, { token, user }) => {
  if (!authUtils.authenticate(token)) {
    return { success: false };
  }

  const dataSet = await db.dataSets.findByPk(dataSetId);
  if (!dataSet || dataSet.dataValues.accountId !== user.accountId) {
    return {
      success: false
    };
  }

  await sequelize.transaction(async (transaction) => {
    await db.dataSetHistory.destroy({ where: { dataSetId }, transaction });
    await db.dataSets.destroy({ where: { dataSetId }, transaction });
  });

  return {
    success: true
  };
};

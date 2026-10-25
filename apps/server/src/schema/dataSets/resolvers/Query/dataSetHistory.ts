import type { QueryResolvers } from './../../../types.generated';
import { sequelize } from '../../../../database';
import { QueryTypes } from 'sequelize';
import * as authUtils from '../../../../utils/authUtils';
import { db } from '../../../../database';

export const dataSetHistory: NonNullable<QueryResolvers['dataSetHistory']> = async (_parent, args, { token, user }) => {
  const { dataSetId, limit, offset } = args;

  if (!authUtils.authenticate(token)) {
    return {
      results: [],
      totalCount: 0
    };
  }

  const validatedId = Number(dataSetId);
  const pageSize = limit ?? 20;
  const pageOffset = offset ?? 0;
  if (!/^[1-9]\d*$/.test(String(dataSetId)) || !Number.isSafeInteger(validatedId) ||
      !Number.isInteger(pageSize) || pageSize < 0 || !Number.isInteger(pageOffset) || pageOffset < 0) {
    return { results: [], totalCount: 0 };
  }

  // confirm dataSetId belongs to current user
  const exists = await db.dataSets.findOne({
    where: {
      accountId: user.accountId,
      dataSetId: validatedId
    }
  });

  if (exists === null) {
    return {
      results: [],
      totalCount: 0
    };
  }

  const [results] = (await sequelize.query(`
    SELECT *
    FROM dataset_history dh
    WHERE dataset_id = :dataSetId
    ORDER BY history_id DESC
    LIMIT :limit
    OFFSET :offset
  `, { replacements: { dataSetId: validatedId, limit: pageSize, offset: pageOffset } })) as Array<any>;

  const [totalCountQuery] = (await sequelize.query(
    `
      SELECT count(*) as c
      FROM dataset_history
      WHERE dataset_id = ${dataSetId} 
    `,
    { raw: true, type: QueryTypes.SELECT, replacements: { dataSetId: validatedId } }
  )) as any[];

  return {
    totalCount: Number(totalCountQuery.c),
    results: results.map((row: any) => ({
      dataSetId: row.dataset_id,
      historyId: row.history_id,
      content: row.content,
      dateCreated: row.date_created
    }))
  };
};

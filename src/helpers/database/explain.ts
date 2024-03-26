import { DataSource, ObjectLiteral, QueryBuilder } from 'typeorm';

type PostgresExplainParameters = {
  analyze?: boolean;
  verbose?: boolean;
  costs?: boolean;
  buffers?: boolean;
  timing?: boolean;
};

export const explain = async <T extends ObjectLiteral>(
  qb: QueryBuilder<T>,
  dataSource?: DataSource,
  explainParameters: PostgresExplainParameters = {
    analyze: true,
    verbose: true,
    buffers: true,
  },
  format: 'text' | 'xml' | 'json' | 'yaml' = 'text',
) => {
  const boolParameters = Object.entries(explainParameters)
    .filter(
      (argument): argument is [string, boolean] =>
        typeof argument[1] === 'boolean',
    )
    .map(([key, value]) => `${key} ${value}`);

  const explainParametersString = [
    ...boolParameters,
    `FORMAT ${format.toUpperCase()}`,
  ]
    .join(', ')
    .toUpperCase();

  const [originalQuery, queryParameters] = qb.getQueryAndParameters();
  const query = `EXPLAIN (${explainParametersString}) ${originalQuery}`;
  return dataSource.query(query, queryParameters);
};

import camelCase from 'camelcase';

export const queryToCamelCase = (req, res, next) => {
  const { query } = req;

  const newQuery =
    Object.keys(query).reduce(
      (accQuery, key) => ({ ...accQuery, [camelCase(key)]: query[key] }),
      {}
    ) || {};

  req.query = newQuery;

  next();
};

/**
 * PFM-01: reusable pagination helper.
 *
 * Reads `page` and `limit` from req.query, returns a plain object
 * with everything the controller needs to paginate a Mongoose query
 * and build the response envelope.
 *
 * Usage in a controller:
 *   const { skip, limit, page } = parsePagination(req);
 *   const [data, total] = await Promise.all([
 *     Model.find(filter).skip(skip).limit(limit),
 *     Model.countDocuments(filter),
 *   ]);
 *   res.json(paginationEnvelope({ data, total, page, limit }));
 */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const paginationEnvelope = ({ data, total, page, limit }) => ({
  success: true,
  count: data.length,
  page,
  totalPages: Math.ceil(total / limit),
  total,
  data,
});

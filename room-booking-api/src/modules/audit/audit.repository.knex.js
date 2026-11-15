function toAuditLog(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    eventType: row.event_type,
    payload: row.payload,
    createdAt: row.created_at,
  };
}

function createKnexAuditRepository(db) {
  return {
    async create({ eventType, payload }) {
      const [row] = await db("audit_log")
        .insert({
          event_type: eventType,
          payload,
        })
        .returning("*");

      return toAuditLog(row);
    },

    async findAll({ eventType, page = 1, limit = 20 }) {
      const filters = {};

      if (eventType !== undefined) {
        filters.event_type = eventType;
      }

      const offset = (page - 1) * limit;

      const baseQuery = db("audit_log").where(filters);

      const [rows, countResult] = await Promise.all([
        baseQuery
          .clone()
          .select("*")
          .orderBy("created_at", "desc")
          .orderBy("id", "desc")
          .limit(limit)
          .offset(offset),

        baseQuery
          .clone()
          .count({
            count: "*",
          })
          .first(),
      ]);

      return {
        items: rows.map(toAuditLog),
        total: Number(countResult.count),
      };
    },
  };
}

module.exports = {
  createKnexAuditRepository,
};

function createInMemoryAuditRepository() {
  const entries = [];

  let nextId = 1;

  return {
    async create({ eventType, payload }) {
      const entry = {
        id: nextId++,
        eventType,
        payload,
        createdAt: new Date(),
      };

      entries.push(entry);

      return entry;
    },

    async findAll({ eventType, page = 1, limit = 20 }) {
      let result = [...entries];

      if (eventType !== undefined) {
        result = result.filter((entry) => entry.eventType === eventType);
      }

      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
          b.id - a.id,
      );

      const total = result.length;

      const offset = (page - 1) * limit;

      return {
        items: result.slice(offset, offset + limit),
        total,
      };
    },
  };
}

module.exports = {
  createInMemoryAuditRepository,
};

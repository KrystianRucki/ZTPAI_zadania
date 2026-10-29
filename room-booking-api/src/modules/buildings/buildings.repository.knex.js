function toBuilding(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    createdAt: row.created_at,
  };
}

function createKnexBuildingsRepository(db) {
  return {
    async findAll() {
      const rows = await db("buildings as b")
        .leftJoin("rooms as r", "r.building_id", "b.id")
        .select("b.id", "b.name", "b.address", "b.created_at")
        .count({
          rooms_count: "r.id",
        })
        .groupBy("b.id", "b.name", "b.address", "b.created_at")
        .orderBy("b.id", "asc");

      return rows.map((row) => ({
        ...toBuilding(row),
        roomsCount: Number(row.rooms_count),
      }));
    },

    async findById(id) {
      const row = await db("buildings").where({ id }).first();

      return toBuilding(row);
    },

    async create(data) {
      const [row] = await db("buildings")
        .insert({
          name: data.name,
          address: data.address,
        })
        .returning("*");

      return toBuilding(row);
    },
  };
}

module.exports = {
  createKnexBuildingsRepository,
};

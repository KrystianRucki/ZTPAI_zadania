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
      const rows = await db("buildings").select("*").orderBy("id", "asc");

      return rows.map(toBuilding);
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

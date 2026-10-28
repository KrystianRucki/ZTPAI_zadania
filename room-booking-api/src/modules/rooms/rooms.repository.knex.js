function toRoom(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    buildingId: row.building_id,
    name: row.name,
    capacity: row.capacity,
    createdAt: row.created_at,
  };
}

function createKnexRoomsRepository(db) {
  return {
    async findAll() {
      const rows = await db("rooms").select("*").orderBy("id", "asc");

      return rows.map(toRoom);
    },

    async findById(id) {
      const row = await db("rooms").where({ id }).first();

      return toRoom(row);
    },

    async create(data) {
      const [row] = await db("rooms")
        .insert({
          building_id: data.buildingId,
          name: data.name,
          capacity: data.capacity,
        })
        .returning("*");

      return toRoom(row);
    },
  };
}

module.exports = {
  createKnexRoomsRepository,
};

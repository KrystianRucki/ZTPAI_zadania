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

function toRoomWithBuilding(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity,

    building: {
      id: row.building_id,
      name: row.building_name,
    },
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

    async findByIdWithBuilding(id) {
      const row = await db("rooms as r")
        .join("buildings as b", "b.id", "r.building_id")
        .where("r.id", id)
        .select(
          "r.id",
          "r.name",
          "r.capacity",
          "b.id as building_id",
          "b.name as building_name",
        )
        .first();

      return toRoomWithBuilding(row);
    },

    async findByBuildingId(buildingId) {
      const rows = await db("rooms")
        .where({
          building_id: buildingId,
        })
        .select("*")
        .orderBy("id", "asc");

      return rows.map(toRoom);
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

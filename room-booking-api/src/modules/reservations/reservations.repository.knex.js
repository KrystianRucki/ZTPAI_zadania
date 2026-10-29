function toReservation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    roomId: row.room_id,
    reservedBy: row.reserved_by,
    participants: row.participants,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
  };
}

function toDetailedReservation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,

    room: {
      id: row.room_id,
      name: row.room_name,

      building: {
        id: row.building_id,
        name: row.building_name,
      },
    },

    reservedBy: row.reserved_by,
    participants: row.participants,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
  };
}

function detailedQuery(db) {
  return db("reservations as res")
    .join("rooms as r", "r.id", "res.room_id")
    .join("buildings as b", "b.id", "r.building_id");
}

function createKnexReservationsRepository(db) {
  return {
    async findAll() {
      const rows = await db("reservations").select("*").orderBy("id", "asc");

      return rows.map(toReservation);
    },

    async findById(id) {
      const row = await db("reservations").where({ id }).first();

      return toReservation(row);
    },

    async findByRoomId(roomId) {
      const rows = await db("reservations")
        .where({
          room_id: roomId,
        })
        .orderBy("id", "asc");

      return rows.map(toReservation);
    },

    async findDetailedById(id) {
      const row = await detailedQuery(db)
        .where("res.id", id)
        .select(
          "res.id",
          "res.reserved_by",
          "res.participants",
          "res.start_time",
          "res.end_time",
          "res.status",
          "res.created_at",
          "res.cancelled_at",

          "r.id as room_id",
          "r.name as room_name",

          "b.id as building_id",
          "b.name as building_name",
        )
        .first();

      return toDetailedReservation(row);
    },

    async findAllDetailed({ roomId } = {}) {
      const query = detailedQuery(db);

      if (roomId !== undefined) {
        query.where("res.room_id", roomId);
      }

      const rows = await query
        .select(
          "res.id",
          "res.reserved_by",
          "res.participants",
          "res.start_time",
          "res.end_time",
          "res.status",
          "res.created_at",
          "res.cancelled_at",

          "r.id as room_id",
          "r.name as room_name",

          "b.id as building_id",
          "b.name as building_name",
        )
        .orderBy("res.id", "asc");

      return rows.map(toDetailedReservation);
    },

    async create(data) {
      const [row] = await db("reservations")
        .insert({
          room_id: data.roomId,
          reserved_by: data.reservedBy,
          participants: data.participants,
          start_time: data.startTime,
          end_time: data.endTime,
          status: data.status,
          cancelled_at: data.cancelledAt,
          created_at: data.createdAt,
        })
        .returning("*");

      return toReservation(row);
    },

    async update(reservation) {
      const [row] = await db("reservations")
        .where({
          id: reservation.id,
        })
        .update({
          status: reservation.status,
          cancelled_at: reservation.cancelledAt,
        })
        .returning("*");

      return toReservation(row);
    },
  };
}

module.exports = {
  createKnexReservationsRepository,
};

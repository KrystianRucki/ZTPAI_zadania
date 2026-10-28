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

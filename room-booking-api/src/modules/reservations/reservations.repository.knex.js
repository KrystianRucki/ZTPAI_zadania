const SORT_COLUMNS = {
  startTime: "res.start_time",
  createdAt: "res.created_at",
  participants: "res.participants",
};

function toReservation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,

    roomId: row.room_id,

    user: {
      id: row.user_id,
      email: row.user_email,
    },

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

    user: {
      id: row.user_id,
      email: row.user_email,
    },

    participants: row.participants,

    startTime: row.start_time,

    endTime: row.end_time,

    status: row.status,

    createdAt: row.created_at,

    cancelledAt: row.cancelled_at,
  };
}

function reservationQuery(db) {
  return db("reservations as res").join("users as u", "u.id", "res.user_id");
}

function detailedQuery(db) {
  return db("reservations as res")
    .join("users as u", "u.id", "res.user_id")
    .join("rooms as r", "r.id", "res.room_id")
    .join("buildings as b", "b.id", "r.building_id");
}

function basicSelect(query) {
  return query.select(
    "res.id",
    "res.room_id",
    "res.user_id",
    "res.participants",
    "res.start_time",
    "res.end_time",
    "res.status",
    "res.cancelled_at",
    "res.created_at",
    "u.email as user_email",
  );
}

function detailedSelect(query) {
  return query.select(
    "res.id",
    "res.participants",
    "res.start_time",
    "res.end_time",
    "res.status",
    "res.created_at",
    "res.cancelled_at",

    "u.id as user_id",
    "u.email as user_email",

    "r.id as room_id",
    "r.name as room_name",

    "b.id as building_id",
    "b.name as building_name",
  );
}

function applyFilters(query, filters) {
  if (filters.roomId !== undefined) {
    query.where("res.room_id", filters.roomId);
  }

  if (filters.buildingId !== undefined) {
    query.where("r.building_id", filters.buildingId);
  }

  if (filters.status !== undefined) {
    query.where("res.status", filters.status);
  }

  if (filters.from !== undefined) {
    query.where("res.end_time", ">", filters.from);
  }

  if (filters.to !== undefined) {
    query.where("res.start_time", "<", filters.to);
  }

  return query;
}

function createKnexReservationsRepository(db) {
  return {
    async findAll() {
      const rows = await basicSelect(reservationQuery(db)).orderBy(
        "res.id",
        "asc",
      );

      return rows.map(toReservation);
    },

    async findById(id) {
      const row = await basicSelect(reservationQuery(db))
        .where("res.id", id)
        .first();

      return toReservation(row);
    },

    async findByRoomId(roomId) {
      const rows = await basicSelect(reservationQuery(db))
        .where("res.room_id", roomId)
        .orderBy("res.id", "asc");

      return rows.map(toReservation);
    },

    async findDetailedById(id) {
      const row = await detailedSelect(detailedQuery(db))
        .where("res.id", id)
        .first();

      return toDetailedReservation(row);
    },

    async findAllDetailed({
      roomId,
      buildingId,
      status,
      from,
      to,
      page,
      limit,
      sort,
    }) {
      const filters = {
        roomId,
        buildingId,
        status,
        from,
        to,
      };

      const baseQuery = applyFilters(detailedQuery(db), filters);

      const descending = sort.startsWith("-");

      const sortKey = descending ? sort.slice(1) : sort;

      const sortColumn = SORT_COLUMNS[sortKey];

      const sortDirection = descending ? "desc" : "asc";

      const offset = (page - 1) * limit;

      const [rows, countResult] = await Promise.all([
        detailedSelect(baseQuery.clone())
          .orderBy(sortColumn, sortDirection)
          .orderBy("res.id", "asc")
          .limit(limit)
          .offset(offset),

        baseQuery
          .clone()
          .count({
            count: "res.id",
          })
          .first(),
      ]);

      return {
        items: rows.map(toDetailedReservation),

        total: Number(countResult.count),
      };
    },

    async create(data) {
      const [inserted] = await db("reservations")
        .insert({
          room_id: data.roomId,

          user_id: data.userId,

          participants: data.participants,

          start_time: data.startTime,

          end_time: data.endTime,

          status: data.status,

          cancelled_at: data.cancelledAt,

          created_at: data.createdAt,
        })
        .returning(["id"]);

      const row = await basicSelect(reservationQuery(db))
        .where("res.id", inserted.id)
        .first();

      return toReservation(row);
    },

    async update(reservation) {
      await db("reservations")
        .where({
          id: reservation.id,
        })
        .update({
          status: reservation.status,

          cancelled_at: reservation.cancelledAt,
        });

      const row = await basicSelect(reservationQuery(db))
        .where("res.id", reservation.id)
        .first();

      return toReservation(row);
    },
  };
}

module.exports = {
  createKnexReservationsRepository,
};

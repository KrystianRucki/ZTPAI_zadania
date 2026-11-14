function createInMemoryReservationsRepository() {
  const reservations = [
    {
      id: 1,
      roomId: 1,
      userId: 2,
      participants: 10,
      startTime: new Date("2026-10-20T10:00:00.000Z"),
      endTime: new Date("2026-10-20T12:00:00.000Z"),
      status: "CONFIRMED",
      createdAt: new Date("2026-10-19T08:00:00.000Z"),
      cancelledAt: null,
      internalNote: "seed reservation",
    },
  ];

  let nextReservationId =
    Math.max(0, ...reservations.map((reservation) => reservation.id)) + 1;

  function toReservation(reservation) {
    if (!reservation) {
      return null;
    }

    return {
      ...reservation,

      user: {
        id: reservation.userId,
      },
    };
  }

  return {
    async findAll() {
      return reservations.map(toReservation);
    },

    async findByRoomId(roomId) {
      return reservations
        .filter((reservation) => reservation.roomId === roomId)
        .map(toReservation);
    },

    async findById(id) {
      const reservation = reservations.find(
        (reservation) => reservation.id === id,
      );

      return toReservation(reservation);
    },

    async findDetailedById(id) {
      const reservation = reservations.find(
        (reservation) => reservation.id === id,
      );

      return toReservation(reservation);
    },

    async create(data) {
      const reservation = {
        id: nextReservationId++,
        ...data,
        internalNote: "created via API v2",
      };

      reservations.push(reservation);

      return toReservation(reservation);
    },

    async update(reservation) {
      const index = reservations.findIndex(
        (item) => item.id === reservation.id,
      );

      if (index === -1) {
        return null;
      }

      const storedReservation = {
        ...reservation,

        userId: reservation.userId ?? reservation.user?.id,
      };

      delete storedReservation.user;

      reservations[index] = storedReservation;

      return toReservation(reservations[index]);
    },
  };
}

module.exports = {
  createInMemoryReservationsRepository,
};

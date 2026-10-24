function createInMemoryReservationsRepository() {
  const reservations = [
    {
      id: 1,
      roomId: 1,
      reservedBy: "Jan Kowalski",
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

  return {
    async findAll() {
      return reservations;
    },

    async findByRoomId(roomId) {
      return reservations.filter(
        (reservation) => reservation.roomId === roomId,
      );
    },

    async findById(id) {
      return reservations.find((reservation) => reservation.id === id) ?? null;
    },

    async create(data) {
      const reservation = {
        id: nextReservationId++,
        ...data,
        internalNote: "created via API v2",
      };

      reservations.push(reservation);

      return reservation;
    },

    async update(reservation) {
      return reservation;
    },
  };
}

module.exports = {
  createInMemoryReservationsRepository,
};

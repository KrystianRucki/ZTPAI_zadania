function createInMemoryReservationsRepository() {
  const reservations = [];

  let nextReservationId = 1;

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

function createReservationsService({
  roomsRepository,
  reservationsRepository,
}) {
  async function getAllReservations(roomId) {
    if (roomId !== undefined) {
      return reservationsRepository.findByRoomId(roomId);
    }

    return reservationsRepository.findAll();
  }

  async function createReservation(input) {
    const room = await roomsRepository.findById(input.roomId);

    if (!room) {
      return {
        error: "ROOM_NOT_FOUND",
      };
    }

    if (input.participants > room.capacity) {
      return {
        error: "ROOM_CAPACITY_EXCEEDED",
      };
    }

    const reservation = await reservationsRepository.create({
      roomId: input.roomId,

      reservedBy: input.reservedBy,

      participants: input.participants,

      startTime: input.startTime,

      endTime: input.endTime,

      status: "CONFIRMED",

      createdAt: new Date(),

      cancelledAt: null,
    });

    return {
      reservation,
    };
  }

  async function cancelReservation(id) {
    const reservation = await reservationsRepository.findById(id);

    if (!reservation) {
      return {
        error: "RESERVATION_NOT_FOUND",
      };
    }

    if (reservation.status === "CANCELLED") {
      return {
        reservation,
      };
    }

    reservation.status = "CANCELLED";

    reservation.cancelledAt = new Date();

    await reservationsRepository.update(reservation);

    return {
      reservation,
    };
  }

  return {
    getAllReservations,
    createReservation,
    cancelReservation,
  };
}

module.exports = {
  createReservationsService,
};

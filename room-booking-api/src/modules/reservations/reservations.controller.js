function createReservationsController(reservationsService) {
  return {
    async getAll(req, res) {
      const { roomId } = req.validated.query;

      const reservations = await reservationsService.getAllReservations(roomId);

      res.json(reservations);
    },

    async create(req, res) {
      const result = await reservationsService.createReservation(
        req.validated.body,
      );

      if (result.error === "ROOM_NOT_FOUND") {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      if (result.error === "ROOM_CAPACITY_EXCEEDED") {
        return res.status(409).json({
          message: "Room capacity exceeded",
        });
      }

      res.status(201).json(result.reservation);
    },

    async cancel(req, res) {
      const id = req.validated.params.id;

      const result = await reservationsService.cancelReservation(id);

      if (result.error === "RESERVATION_NOT_FOUND") {
        return res.status(404).json({
          message: "Reservation not found",
        });
      }

      res.json(result.reservation);
    },
  };
}

module.exports = {
  createReservationsController,
};

function createReservationsController(reservationsService) {
  return {
    async getAll(req, res) {
      let roomId;

      if (req.query.roomId !== undefined) {
        roomId = Number(req.query.roomId);
      }

      const reservations = await reservationsService.getAllReservations(roomId);

      res.json(reservations);
    },

    async create(req, res) {
      const { roomId, reservedBy, participants, startTime, endTime } = req.body;

      if (!roomId) {
        return res.status(400).json({
          message: "roomId is required",
        });
      }

      if (!reservedBy) {
        return res.status(400).json({
          message: "reservedBy is required",
        });
      }

      if (typeof participants !== "number" || participants <= 0) {
        return res.status(400).json({
          message: "participants must be a number greater than 0",
        });
      }

      if (!startTime) {
        return res.status(400).json({
          message: "startTime is required",
        });
      }

      if (!endTime) {
        return res.status(400).json({
          message: "endTime is required",
        });
      }

      const result = await reservationsService.createReservation({
        roomId,
        reservedBy,
        participants,
        startTime,
        endTime,
      });

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
      const id = Number(req.params.id);

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

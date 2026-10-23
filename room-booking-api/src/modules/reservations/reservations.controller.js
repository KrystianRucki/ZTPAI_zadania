function createReservationsController(reservationsService) {
  return {
    async getAll(req, res) {
      const { roomId } = req.validated.query;

      const reservations = await reservationsService.getAllReservations(roomId);

      res.json(reservations);
    },

    async create(req, res) {
      const reservation = await reservationsService.createReservation(
        req.validated.body,
      );

      res.status(201).json(reservation);
    },

    async cancel(req, res) {
      const id = req.validated.params.id;

      const reservation = await reservationsService.cancelReservation(id);

      res.json(reservation);
    },
  };
}

module.exports = {
  createReservationsController,
};

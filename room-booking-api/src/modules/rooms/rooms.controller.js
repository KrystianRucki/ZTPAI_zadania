function createRoomsController(roomsService) {
  return {
    async getAll(req, res) {
      const rooms = await roomsService.getAllRooms();

      res.json(rooms);
    },

    async getById(req, res) {
      const id = req.validated.params.id;

      const room = await roomsService.getRoomById(id);

      res.json(room);
    },
  };
}

module.exports = {
  createRoomsController,
};

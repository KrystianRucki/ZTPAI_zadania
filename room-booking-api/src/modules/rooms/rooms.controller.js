function createRoomsController(roomsService) {
  return {
    async getAll(req, res) {
      const rooms = await roomsService.getAllRooms();

      res.json(rooms);
    },

    async getById(req, res) {
      const id = req.validated.params.id;

      const room = await roomsService.getRoomById(id);

      if (!room) {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      res.json(room);
    },
  };
}

module.exports = {
  createRoomsController,
};

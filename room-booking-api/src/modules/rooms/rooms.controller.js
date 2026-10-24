const { toRoomResponse } = require("./rooms.mapper");

function createRoomsController(roomsService) {
  return {
    async getAll(req, res) {
      const rooms = await roomsService.getAllRooms();

      res.json(rooms.map(toRoomResponse));
    },

    async getById(req, res) {
      const id = req.validated.params.id;

      const room = await roomsService.getRoomById(id);

      res.json(toRoomResponse(room));
    },
  };
}

module.exports = {
  createRoomsController,
};

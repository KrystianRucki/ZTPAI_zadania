const { toRoomResponse, toDetailedRoomResponse } = require("./rooms.mapper");

function createRoomsController(roomsService) {
  return {
    async getAll(req, res) {
      const rooms = await roomsService.getAllRooms();

      res.json(rooms.map(toRoomResponse));
    },

    async getById(req, res) {
      const room = await roomsService.getRoomById(req.validated.params.id);

      res.json(toDetailedRoomResponse(room));
    },

    async create(req, res) {
      const room = await roomsService.createRoom(req.validated.body);

      res
        .status(201)
        .location(`/api/rooms/${room.id}`)
        .json(toRoomResponse(room));
    },
  };
}

module.exports = {
  createRoomsController,
};

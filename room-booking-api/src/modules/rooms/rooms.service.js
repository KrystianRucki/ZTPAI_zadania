const { NotFoundError } = require("../../errors/AppError");

function createRoomsService({ roomsRepository }) {
  async function getAllRooms() {
    return roomsRepository.findAll();
  }

  async function getRoomById(id) {
    const room = await roomsRepository.findById(id);

    if (!room) {
      throw new NotFoundError("Room");
    }

    return room;
  }

  return {
    getAllRooms,
    getRoomById,
  };
}

module.exports = {
  createRoomsService,
};

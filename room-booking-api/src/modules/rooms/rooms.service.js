const { NotFoundError } = require("../../errors/AppError");

function createRoomsService({ roomsRepository, buildingsRepository }) {
  async function getAllRooms() {
    return roomsRepository.findAll();
  }

  async function getRoomById(id) {
    const room = await roomsRepository.findByIdWithBuilding(id);

    if (!room) {
      throw new NotFoundError("Room");
    }

    return room;
  }

  async function createRoom(input) {
    const building = await buildingsRepository.findById(input.buildingId);

    if (!building) {
      throw new NotFoundError("Building");
    }

    return roomsRepository.create(input);
  }

  return {
    getAllRooms,
    getRoomById,
    createRoom,
  };
}

module.exports = {
  createRoomsService,
};

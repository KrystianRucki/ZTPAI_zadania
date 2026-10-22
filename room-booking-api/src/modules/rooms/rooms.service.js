function createRoomsService({ roomsRepository }) {
  async function getAllRooms() {
    return roomsRepository.findAll();
  }

  async function getRoomById(id) {
    return roomsRepository.findById(id);
  }

  return {
    getAllRooms,
    getRoomById,
  };
}

module.exports = {
  createRoomsService,
};

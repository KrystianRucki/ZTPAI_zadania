const { NotFoundError } = require("../../errors/AppError");

function createBuildingsService({ buildingsRepository, roomsRepository }) {
  async function getAllBuildings() {
    return buildingsRepository.findAll();
  }

  async function getBuildingById(id) {
    const building = await buildingsRepository.findById(id);

    if (!building) {
      throw new NotFoundError("Building");
    }

    return building;
  }

  async function createBuilding(input) {
    return buildingsRepository.create(input);
  }

  async function getRoomsByBuildingId(id) {
    const building = await buildingsRepository.findById(id);

    if (!building) {
      throw new NotFoundError("Building");
    }

    return roomsRepository.findByBuildingId(id);
  }

  return {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    getRoomsByBuildingId,
  };
}

module.exports = {
  createBuildingsService,
};

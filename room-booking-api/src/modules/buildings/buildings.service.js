const { NotFoundError } = require("../../errors/AppError");

function createBuildingsService({ buildingsRepository }) {
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

  return {
    getAllBuildings,
    getBuildingById,
    createBuilding,
  };
}

module.exports = {
  createBuildingsService,
};

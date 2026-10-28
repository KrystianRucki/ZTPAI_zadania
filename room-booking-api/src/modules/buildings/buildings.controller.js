const { toBuildingResponse } = require("./buildings.mapper");

function createBuildingsController(buildingsService) {
  return {
    async getAll(req, res) {
      const buildings = await buildingsService.getAllBuildings();

      res.json(buildings.map(toBuildingResponse));
    },

    async getById(req, res) {
      const building = await buildingsService.getBuildingById(
        req.validated.params.id,
      );

      res.json(toBuildingResponse(building));
    },

    async create(req, res) {
      const building = await buildingsService.createBuilding(
        req.validated.body,
      );

      res
        .status(201)
        .location(`/api/buildings/${building.id}`)
        .json(toBuildingResponse(building));
    },
  };
}

module.exports = {
  createBuildingsController,
};

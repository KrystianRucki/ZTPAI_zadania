const { Router } = require("express");

const validate = require("../../middleware/validate");

const { idParams, createBuildingBody } = require("./buildings.schemas");

function createBuildingsRouter(controller) {
  const router = Router();

  router.get("/", controller.getAll);

  router.get(
    "/:id/rooms",
    validate({
      params: idParams,
    }),
    controller.getRooms,
  );

  router.get(
    "/:id",
    validate({
      params: idParams,
    }),
    controller.getById,
  );

  router.post(
    "/",
    validate({
      body: createBuildingBody,
    }),
    controller.create,
  );

  return router;
}

module.exports = {
  createBuildingsRouter,
};

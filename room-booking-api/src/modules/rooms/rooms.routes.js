const { Router } = require("express");

const validate = require("../../middleware/validate");

const { idParams } = require("./rooms.schemas");

function createRoomsRouter(controller) {
  const router = Router();

  router.get("/", controller.getAll);

  router.get(
    "/:id",
    validate({
      params: idParams,
    }),
    controller.getById,
  );

  return router;
}

module.exports = {
  createRoomsRouter,
};

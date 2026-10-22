const { Router } = require("express");

function createRoomsRouter(controller) {
  const router = Router();

  router.get("/", controller.getAll);

  router.get("/:id", controller.getById);

  return router;
}

module.exports = {
  createRoomsRouter,
};

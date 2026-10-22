const { Router } = require("express");

function createReservationsRouter(controller) {
  const router = Router();

  router.get("/", controller.getAll);

  router.post("/", controller.create);

  router.patch("/:id/cancel", controller.cancel);

  return router;
}

module.exports = {
  createReservationsRouter,
};

const { Router } = require("express");

const validate = require("../../middleware/validate");

const { registerBody } = require("./auth.schemas");

function createAuthRouter(controller) {
  const router = Router();

  router.post(
    "/register",
    validate({
      body: registerBody,
    }),
    controller.register,
  );

  return router;
}

module.exports = {
  createAuthRouter,
};

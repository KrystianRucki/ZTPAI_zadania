const express = require("express");

const swaggerUi = require("swagger-ui-express");

const openapiDocument = require("./docs/openapi");

const requestLogger = require("./middleware/requestLogger");

const notFound = require("./middleware/notFound");

const errorHandler = require("./middleware/errorHandler");

const { createAuthenticate } = require("./middleware/authenticate");

const {
  createBuildingsService,
} = require("./modules/buildings/buildings.service");

const {
  createBuildingsController,
} = require("./modules/buildings/buildings.controller");

const {
  createBuildingsRouter,
} = require("./modules/buildings/buildings.routes");

const { createRoomsService } = require("./modules/rooms/rooms.service");

const { createRoomsController } = require("./modules/rooms/rooms.controller");

const { createRoomsRouter } = require("./modules/rooms/rooms.routes");

const {
  createReservationsService,
} = require("./modules/reservations/reservations.service");

const {
  createReservationsController,
} = require("./modules/reservations/reservations.controller");

const {
  createReservationsRouter,
} = require("./modules/reservations/reservations.routes");

const { createAuthService } = require("./modules/auth/auth.service");

const { createAuthController } = require("./modules/auth/auth.controller");

const { createAuthRouter } = require("./modules/auth/auth.routes");

function createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  runInTransaction,
  jwtSecret,
  jwtExpiresIn,
  now = () => new Date(),
}) {
  const app = express();

  app.use(requestLogger);

  app.use(express.json());

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  const requireAuth = createAuthenticate(jwtSecret);

  const authService = createAuthService({
    usersRepository,
    jwtSecret,
    jwtExpiresIn,
  });

  const authController = createAuthController(authService);

  const buildingsService = createBuildingsService({
    buildingsRepository,
    roomsRepository,
  });

  const buildingsController = createBuildingsController(buildingsService);

  const roomsService = createRoomsService({
    roomsRepository,
    buildingsRepository,
  });

  const roomsController = createRoomsController(roomsService);

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
    runInTransaction,
    now,
  });

  const reservationsController =
    createReservationsController(reservationsService);

  app.use(
    "/api/auth",
    createAuthRouter({
      controller: authController,

      authenticate: requireAuth,
    }),
  );

  app.use(
    "/api/buildings",
    requireAuth,
    createBuildingsRouter(buildingsController),
  );

  app.use("/api/rooms", requireAuth, createRoomsRouter(roomsController));

  app.use(
    "/api/reservations",
    requireAuth,
    createReservationsRouter(reservationsController),
  );

  app.use(notFound);

  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

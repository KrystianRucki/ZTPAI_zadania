const express = require("express");

const requestLogger = require("./middleware/requestLogger");

const notFound = require("./middleware/notFound");

const errorHandler = require("./middleware/errorHandler");

const { createAuthenticate } = require("./middleware/authenticate");

const { createAuthService } = require("./modules/auth/auth.service");

const { createAuthController } = require("./modules/auth/auth.controller");

const { createAuthRouter } = require("./modules/auth/auth.routes");

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

function createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  runInTransaction,
  jwtSecret,
  jwtExpiresIn,
  now,
}) {
  const app = express();

  app.use(requestLogger);

  app.use(express.json());

  const authenticate = createAuthenticate(jwtSecret);

  const authService = createAuthService({
    usersRepository,
    jwtSecret,
    jwtExpiresIn,
  });

  const buildingsService = createBuildingsService({
    buildingsRepository,
    roomsRepository,
  });

  const roomsService = createRoomsService({
    roomsRepository,
    buildingsRepository,
  });

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
    runInTransaction,
    now,
  });

  const authController = createAuthController(authService);

  const buildingsController = createBuildingsController(buildingsService);

  const roomsController = createRoomsController(roomsService);

  const reservationsController =
    createReservationsController(reservationsService);

  app.use(
    "/api/auth",
    createAuthRouter({
      controller: authController,

      authenticate,
    }),
  );

  app.use(
    "/api/buildings",
    authenticate,
    createBuildingsRouter(buildingsController),
  );

  app.use("/api/rooms", authenticate, createRoomsRouter(roomsController));

  app.use(
    "/api/reservations",
    authenticate,
    createReservationsRouter(reservationsController),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

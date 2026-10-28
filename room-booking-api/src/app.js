const express = require("express");

const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

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
  now,
}) {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  const buildingsService = createBuildingsService({
    buildingsRepository,
  });

  const roomsService = createRoomsService({
    roomsRepository,
    buildingsRepository,
  });

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
    now,
  });

  app.use(
    "/api/buildings",
    createBuildingsRouter(createBuildingsController(buildingsService)),
  );

  app.use("/api/rooms", createRoomsRouter(createRoomsController(roomsService)));

  app.use(
    "/api/reservations",
    createReservationsRouter(createReservationsController(reservationsService)),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

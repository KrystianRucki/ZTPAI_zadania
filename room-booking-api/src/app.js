const express = require("express");

const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

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

function createApp({ roomsRepository, reservationsRepository, now }) {
  const app = express();

  app.use(requestLogger);

  app.use(express.json());

  const roomsService = createRoomsService({
    roomsRepository,
  });

  const roomsController = createRoomsController(roomsService);

  app.use("/api/rooms", createRoomsRouter(roomsController));

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
    now,
  });

  const reservationsController =
    createReservationsController(reservationsService);

  app.use(
    "/api/reservations",
    createReservationsRouter(reservationsController),
  );

  app.use(notFound);

  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

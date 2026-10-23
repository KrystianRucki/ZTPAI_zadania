const express = require("express");

const requestLogger = require("./middleware/requestLogger");

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

function createApp({ roomsRepository, reservationsRepository }) {
  const app = express();

  // Nadaje requestId i ustawia nagłówek X-Request-Id
  app.use(requestLogger);

  // Parsuje JSON z request body
  app.use(express.json());

  // Rooms

  const roomsService = createRoomsService({
    roomsRepository,
  });

  const roomsController = createRoomsController(roomsService);

  app.use("/api/rooms", createRoomsRouter(roomsController));

  // Reservations

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
  });

  const reservationsController =
    createReservationsController(reservationsService);

  app.use(
    "/api/reservations",
    createReservationsRouter(reservationsController),
  );

  return app;
}

module.exports = {
  createApp,
};

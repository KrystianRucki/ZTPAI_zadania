const express = require("express");

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

  app.use(express.json());

  const roomsService = createRoomsService({
    roomsRepository,
  });

  const roomsController = createRoomsController(roomsService);

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
  });

  const reservationsController =
    createReservationsController(reservationsService);

  app.use("/api/rooms", createRoomsRouter(roomsController));

  app.use(
    "/api/reservations",
    createReservationsRouter(reservationsController),
  );

  return app;
}

module.exports = {
  createApp,
};

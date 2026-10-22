const { createApp } = require("./app");

const {
  createInMemoryRoomsRepository,
} = require("./modules/rooms/rooms.repository.memory");

const {
  createInMemoryReservationsRepository,
} = require("./modules/reservations/reservations.repository.memory");

const roomsRepository = createInMemoryRoomsRepository();

const reservationsRepository = createInMemoryReservationsRepository();

const app = createApp({
  roomsRepository,
  reservationsRepository,
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

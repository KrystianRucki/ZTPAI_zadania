const { createApp } = require("./app");

try {
  process.loadEnvFile();
} catch {
  // .env może nie istnieć, jeżeli zmienne są przekazane z zewnątrz
}

const mode = process.env.REPOSITORY_MODE ?? "knex";

let buildingsRepository;
let roomsRepository;
let reservationsRepository;

if (mode === "memory") {
  const {
    createInMemoryBuildingsRepository,
  } = require("./modules/buildings/buildings.repository.memory");

  const {
    createInMemoryRoomsRepository,
  } = require("./modules/rooms/rooms.repository.memory");

  const {
    createInMemoryReservationsRepository,
  } = require("./modules/reservations/reservations.repository.memory");

  buildingsRepository = createInMemoryBuildingsRepository();
  roomsRepository = createInMemoryRoomsRepository();
  reservationsRepository = createInMemoryReservationsRepository();
} else {
  const db = require("./db/knex");

  const {
    createKnexBuildingsRepository,
  } = require("./modules/buildings/buildings.repository.knex");

  const {
    createKnexRoomsRepository,
  } = require("./modules/rooms/rooms.repository.knex");

  const {
    createKnexReservationsRepository,
  } = require("./modules/reservations/reservations.repository.knex");

  buildingsRepository = createKnexBuildingsRepository(db);
  roomsRepository = createKnexRoomsRepository(db);
  reservationsRepository = createKnexReservationsRepository(db);
}

const app = createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000 (${mode})`);
});

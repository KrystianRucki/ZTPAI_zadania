const { createApp } = require("./app");

try {
  process.loadEnvFile();
} catch {
  // .env może nie istnieć
}

const mode = process.env.REPOSITORY_MODE ?? "knex";

const jwtSecret = process.env.JWT_SECRET;

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "15m";

let buildingsRepository;
let roomsRepository;
let reservationsRepository;
let usersRepository;
let runInTransaction;

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

  const {
    createInMemoryUsersRepository,
  } = require("./modules/auth/users.repository.memory");

  buildingsRepository = createInMemoryBuildingsRepository();

  roomsRepository = createInMemoryRoomsRepository();

  reservationsRepository = createInMemoryReservationsRepository();

  usersRepository = createInMemoryUsersRepository();

  runInTransaction = async (fn) =>
    fn({
      buildings: buildingsRepository,

      rooms: {
        ...roomsRepository,

        lockById: roomsRepository.findById,
      },

      reservations: reservationsRepository,
    });
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

  const {
    createKnexUsersRepository,
  } = require("./modules/auth/users.repository.knex");

  const { createKnexUnitOfWork } = require("./db/unitOfWork");

  buildingsRepository = createKnexBuildingsRepository(db);

  roomsRepository = createKnexRoomsRepository(db);

  reservationsRepository = createKnexReservationsRepository(db);

  usersRepository = createKnexUsersRepository(db);

  runInTransaction = createKnexUnitOfWork(db);
}

const app = createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  runInTransaction,
  jwtSecret,
  jwtExpiresIn,
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000 (${mode})`);
});

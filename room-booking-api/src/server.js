const config = require("./config");

const { createApp } = require("./app");

let buildingsRepository;
let roomsRepository;
let reservationsRepository;
let usersRepository;
let runInTransaction;

if (config.REPOSITORY_MODE === "memory") {
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
      rooms: roomsRepository,
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

  jwtSecret: config.JWT_SECRET,

  jwtExpiresIn: config.JWT_EXPIRES_IN,
});

app.listen(config.PORT, () => {
  console.log(
    `Server running on http://localhost:${config.PORT} (${config.REPOSITORY_MODE})`,
  );
});

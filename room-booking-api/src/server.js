const config = require("./config");

const { createApp } = require("./app");

const { createEventBus } = require("./events/eventBus");

const {
  registerReservationEventHandlers,
} = require("./events/registerReservationEventHandlers");

let buildingsRepository;
let roomsRepository;
let reservationsRepository;
let usersRepository;
let auditRepository;

let runInTransaction;

let db = null;

// ========================================
// Repository mode
// ========================================

if (config.REPOSITORY_MODE === "memory") {
  // --------------------------------------
  // In-memory repositories
  // --------------------------------------

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

  const {
    createInMemoryAuditRepository,
  } = require("./modules/audit/audit.repository.memory");

  buildingsRepository = createInMemoryBuildingsRepository();

  roomsRepository = createInMemoryRoomsRepository();

  reservationsRepository = createInMemoryReservationsRepository();

  usersRepository = createInMemoryUsersRepository();

  auditRepository = createInMemoryAuditRepository();

  // --------------------------------------
  // In-memory Unit of Work
  // --------------------------------------

  runInTransaction = async (fn) =>
    fn({
      buildings: buildingsRepository,

      rooms: roomsRepository,

      reservations: reservationsRepository,
    });
} else {
  // --------------------------------------
  // PostgreSQL / Knex repositories
  // --------------------------------------

  db = require("./db/knex");

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

  const {
    createKnexAuditRepository,
  } = require("./modules/audit/audit.repository.knex");

  const { createKnexUnitOfWork } = require("./db/unitOfWork");

  buildingsRepository = createKnexBuildingsRepository(db);

  roomsRepository = createKnexRoomsRepository(db);

  reservationsRepository = createKnexReservationsRepository(db);

  usersRepository = createKnexUsersRepository(db);

  auditRepository = createKnexAuditRepository(db);

  runInTransaction = createKnexUnitOfWork(db);
}

// ========================================
// Event Bus
// ========================================

const eventBus = createEventBus();

// ========================================
// Event listeners
// ========================================

registerReservationEventHandlers({
  eventBus,
  auditRepository,
  usersRepository,
});

// ========================================
// Express application
// ========================================

const app = createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,

  // Zadanie 4
  auditRepository,
  eventBus,

  runInTransaction,

  jwtSecret: config.JWT_SECRET,

  jwtExpiresIn: config.JWT_EXPIRES_IN,
});

// ========================================
// Start HTTP server
// ========================================

const server = app.listen(config.PORT, () => {
  console.log(
    `Server running on http://localhost:${config.PORT} (${config.REPOSITORY_MODE})`,
  );
});

// ========================================
// Graceful shutdown
// ========================================

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  server.close(async (error) => {
    if (error) {
      console.error("Error while closing HTTP server:", error);

      process.exitCode = 1;
    }

    try {
      if (db) {
        await db.destroy();

        console.log("Database connection pool closed.");
      }

      console.log("Graceful shutdown completed.");

      process.exit(error ? 1 : 0);
    } catch (dbError) {
      console.error("Error while closing database connection:", dbError);

      process.exit(1);
    }
  });
}

// ========================================
// Signals
// ========================================

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

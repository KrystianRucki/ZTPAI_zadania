const express = require("express");
const swaggerUi = require("swagger-ui-express");

const openapiDocument = require("./docs/openapi");

const requestLogger = require("./middleware/requestLogger");
const { createAuthenticate } = require("./middleware/authenticate");
const authorize = require("./middleware/authorize");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

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

const { createAuditService } = require("./modules/audit/audit.service");

const { createAuditController } = require("./modules/audit/audit.controller");

const { createAuditRouter } = require("./modules/audit/audit.routes");

function createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  auditRepository,
  runInTransaction,
  eventBus,
  jwtSecret,
  jwtExpiresIn,
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

  const authController = createAuthController(authService);

  const buildingsService = createBuildingsService({
    buildingsRepository,
  });

  const buildingsController = createBuildingsController(buildingsService);

  const roomsService = createRoomsService({
    roomsRepository,
    buildingsRepository,
  });

  const roomsController = createRoomsController(roomsService);

  const reservationsService = createReservationsService({
    roomsRepository,
    reservationsRepository,
    runInTransaction,
    eventBus,
  });

  const reservationsController =
    createReservationsController(reservationsService);

  const auditService = createAuditService({
    auditRepository,
  });

  const auditController = createAuditController({
    auditService,
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

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

  app.use(
    "/api/admin/audit-log",
    authenticate,
    authorize("ADMIN"),
    createAuditRouter({
      auditController,
    }),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

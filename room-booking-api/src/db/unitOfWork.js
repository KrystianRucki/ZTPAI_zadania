const {
  createKnexBuildingsRepository,
} = require("../modules/buildings/buildings.repository.knex");

const {
  createKnexRoomsRepository,
} = require("../modules/rooms/rooms.repository.knex");

const {
  createKnexReservationsRepository,
} = require("../modules/reservations/reservations.repository.knex");

function createKnexUnitOfWork(db) {
  return async function runInTransaction(fn) {
    return db.transaction(async (trx) => {
      const repositories = {
        buildings: createKnexBuildingsRepository(trx),

        rooms: createKnexRoomsRepository(trx),

        reservations: createKnexReservationsRepository(trx),
      };

      return fn(repositories);
    });
  };
}

module.exports = {
  createKnexUnitOfWork,
};

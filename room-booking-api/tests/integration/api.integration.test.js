const request = require("supertest");

const config = require("../../src/config");

const db = require("../../src/db/knex");

const { createApp } = require("../../src/app");

const {
  createKnexBuildingsRepository,
} = require("../../src/modules/buildings/buildings.repository.knex");

const {
  createKnexRoomsRepository,
} = require("../../src/modules/rooms/rooms.repository.knex");

const {
  createKnexReservationsRepository,
} = require("../../src/modules/reservations/reservations.repository.knex");

const {
  createKnexUsersRepository,
} = require("../../src/modules/auth/users.repository.knex");

const { createKnexUnitOfWork } = require("../../src/db/unitOfWork");

const buildingsRepository = createKnexBuildingsRepository(db);

const roomsRepository = createKnexRoomsRepository(db);

const reservationsRepository = createKnexReservationsRepository(db);

const usersRepository = createKnexUsersRepository(db);

const runInTransaction = createKnexUnitOfWork(db);

const app = createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  runInTransaction,

  jwtSecret: config.JWT_SECRET,

  jwtExpiresIn: config.JWT_EXPIRES_IN,
});

const PASSWORD = "user-password-123";

async function registerAndLogin(email) {
  await request(app)
    .post("/api/auth/register")
    .send({
      email,
      password: PASSWORD,
    })
    .expect(201);

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: PASSWORD,
    })
    .expect(200);

  return response.body.accessToken;
}

async function createBuildingAndRoom() {
  const [building] = await db("buildings")
    .insert({
      name: "Test Building",
      address: "Test Address 1",
    })
    .returning("*");

  const [room] = await db("rooms")
    .insert({
      building_id: building.id,
      name: "101",
      capacity: 20,
    })
    .returning("*");

  return {
    building,
    room,
  };
}

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.raw(`
    TRUNCATE TABLE
      reservations,
      rooms,
      buildings,
      users
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  await db.destroy();
});

describe("API integration", () => {
  test("register + login + GET /api/auth/me", async () => {
    const email = "user1@example.com";

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password: PASSWORD,
      })
      .expect(201);

    expect(registerResponse.body).toMatchObject({
      email,
      role: "USER",
    });

    expect(registerResponse.body).not.toHaveProperty("passwordHash");

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: PASSWORD,
      })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeDefined();

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email,
      role: "USER",
    });
  });

  test("POST /api/reservations returns 201, Location and saves row", async () => {
    const { room } = await createBuildingAndRoom();

    const token = await registerAndLogin("reservation-owner@example.com");

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: room.id,
        participants: 5,
        startTime: "2035-01-01T10:00:00.000Z",
        endTime: "2035-01-01T12:00:00.000Z",
      })
      .expect(201);

    expect(response.headers.location).toBe(
      `/api/reservations/${response.body.id}`,
    );

    const reservation = await db("reservations")
      .where({
        id: response.body.id,
      })
      .first();

    expect(reservation).toBeDefined();

    expect(reservation.room_id).toBe(room.id);

    expect(reservation.participants).toBe(5);

    expect(reservation.status).toBe("CONFIRMED");
  });

  test("returns 400 with details for invalid body", async () => {
    const token = await registerAndLogin("validation@example.com");

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: 1,
        participants: 0,
        startTime: "invalid-date",
        endTime: "invalid-date",
      })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: "body",
          field: "participants",
        }),
      ]),
    );
  });

  test("returns 401 without token", async () => {
    const response = await request(app).get("/api/buildings").expect(401);

    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  test("returns 403 when USER tries to create room", async () => {
    const [building] = await db("buildings")
      .insert({
        name: "Building A",
        address: "Address A",
      })
      .returning("*");

    const token = await registerAndLogin("normal-user@example.com");

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        buildingId: building.id,
        name: "201",
        capacity: 30,
      })
      .expect(403);

    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("returns 404 when USER reads another user's reservation", async () => {
    const { room } = await createBuildingAndRoom();

    const ownerToken = await registerAndLogin("owner@example.com");

    const foreignToken = await registerAndLogin("foreign@example.com");

    const created = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        roomId: room.id,
        participants: 5,
        startTime: "2035-01-01T10:00:00.000Z",
        endTime: "2035-01-01T11:00:00.000Z",
      })
      .expect(201);

    const response = await request(app)
      .get(`/api/reservations/${created.body.id}`)
      .set("Authorization", `Bearer ${foreignToken}`)
      .expect(404);

    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  test("returns 409 ROOM_ALREADY_BOOKED for overlapping reservation", async () => {
    const { room } = await createBuildingAndRoom();

    const token = await registerAndLogin("overlap@example.com");

    await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: room.id,
        participants: 5,
        startTime: "2035-01-01T10:00:00.000Z",
        endTime: "2035-01-01T12:00:00.000Z",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: room.id,
        participants: 5,
        startTime: "2035-01-01T11:00:00.000Z",
        endTime: "2035-01-01T13:00:00.000Z",
      })
      .expect(409);

    expect(response.body.error.code).toBe("ROOM_ALREADY_BOOKED");
  });

  test("pagination returns correct meta.total and data length", async () => {
    const { room } = await createBuildingAndRoom();

    const token = await registerAndLogin("pagination@example.com");

    const ranges = [
      {
        startTime: "2035-01-01T10:00:00.000Z",
        endTime: "2035-01-01T11:00:00.000Z",
      },
      {
        startTime: "2035-01-01T12:00:00.000Z",
        endTime: "2035-01-01T13:00:00.000Z",
      },
      {
        startTime: "2035-01-01T14:00:00.000Z",
        endTime: "2035-01-01T15:00:00.000Z",
      },
    ];

    for (const range of ranges) {
      await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          roomId: room.id,
          participants: 5,
          ...range,
        })
        .expect(201);
    }

    const response = await request(app)
      .get("/api/reservations?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(2);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
  });
});

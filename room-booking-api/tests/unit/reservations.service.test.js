const {
  createReservationsService,
} = require("../../src/modules/reservations/reservations.service");

const {
  createInMemoryRoomsRepository,
} = require("../../src/modules/rooms/rooms.repository.memory");

const {
  createInMemoryReservationsRepository,
} = require("../../src/modules/reservations/reservations.repository.memory");

const USER_A = {
  id: 2,
  role: "USER",
};

const USER_B = {
  id: 3,
  role: "USER",
};

const ADMIN = {
  id: 1,
  role: "ADMIN",
};

const INITIAL_NOW = "2035-01-01T08:00:00.000Z";

function createTestContext() {
  const roomsRepository = createInMemoryRoomsRepository();

  const reservationsRepository = createInMemoryReservationsRepository();

  let currentNow = new Date(INITIAL_NOW);

  const runInTransaction = async (fn) => {
    return fn({
      rooms: roomsRepository,
      reservations: reservationsRepository,
    });
  };

  const service = createReservationsService({
    roomsRepository,
    reservationsRepository,
    runInTransaction,

    now: () => new Date(currentNow),
  });

  return {
    service,

    roomsRepository,

    reservationsRepository,

    setNow(value) {
      currentNow = new Date(value);
    },
  };
}

function createInput({
  roomId = 1,
  participants = 5,
  startTime = "2035-01-01T10:00:00.000Z",
  endTime = "2035-01-01T12:00:00.000Z",
} = {}) {
  return {
    roomId,
    participants,
    startTime,
    endTime,
  };
}

describe("reservations.service", () => {
  test("rejects partial overlap", async () => {
    const ctx = createTestContext();

    await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_A,
    );

    await expect(
      ctx.service.createReservation(
        createInput({
          startTime: "2035-01-01T11:00:00.000Z",

          endTime: "2035-01-01T13:00:00.000Z",
        }),

        USER_B,
      ),
    ).rejects.toMatchObject({
      code: "ROOM_ALREADY_BOOKED",
    });
  });

  test("rejects reservation containing existing reservation", async () => {
    const ctx = createTestContext();

    await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_A,
    );

    await expect(
      ctx.service.createReservation(
        createInput({
          startTime: "2035-01-01T09:00:00.000Z",

          endTime: "2035-01-01T13:00:00.000Z",
        }),

        USER_B,
      ),
    ).rejects.toMatchObject({
      code: "ROOM_ALREADY_BOOKED",
    });
  });

  test("allows touching time ranges", async () => {
    const ctx = createTestContext();

    await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_A,
    );

    const result = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_B,
    );

    expect(result.status).toBe("CONFIRMED");
  });

  test("allows same time range in another room", async () => {
    const ctx = createTestContext();

    const room2 = await ctx.roomsRepository.findById(2);

    expect(room2).not.toBeNull();

    await ctx.service.createReservation(
      createInput({
        roomId: 1,

        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_A,
    );

    const result = await ctx.service.createReservation(
      createInput({
        roomId: 2,

        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_B,
    );

    expect(result.status).toBe("CONFIRMED");

    expect(result.roomId).toBe(2);
  });

  test("CANCELLED reservation does not block the time range", async () => {
    const ctx = createTestContext();

    const first = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_A,
    );

    await ctx.service.cancelReservation(first.id, USER_A);

    const second = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T12:00:00.000Z",
      }),

      USER_B,
    );

    expect(second.status).toBe("CONFIRMED");
  });

  test("participants equal to room capacity are allowed", async () => {
    const ctx = createTestContext();

    const room = await ctx.roomsRepository.findById(1);

    const result = await ctx.service.createReservation(
      createInput({
        participants: room.capacity,
      }),

      USER_A,
    );

    expect(result.participants).toBe(room.capacity);
  });

  test("capacity + 1 is rejected", async () => {
    const ctx = createTestContext();

    const room = await ctx.roomsRepository.findById(1);

    await expect(
      ctx.service.createReservation(
        createInput({
          participants: room.capacity + 1,
        }),

        USER_A,
      ),
    ).rejects.toMatchObject({
      code: "ROOM_CAPACITY_EXCEEDED",
    });
  });

  test.each([
    {
      name: "exactly 15 minutes",
      startTime: "2035-01-01T10:00:00.000Z",
      endTime: "2035-01-01T10:15:00.000Z",
      allowed: true,
    },

    {
      name: "exactly 8 hours",
      startTime: "2035-01-01T10:00:00.000Z",
      endTime: "2035-01-01T18:00:00.000Z",
      allowed: true,
    },

    {
      name: "14 minutes",
      startTime: "2035-01-01T10:00:00.000Z",
      endTime: "2035-01-01T10:14:00.000Z",
      allowed: false,
    },

    {
      name: "8 hours 1 minute",
      startTime: "2035-01-01T10:00:00.000Z",
      endTime: "2035-01-01T18:01:00.000Z",
      allowed: false,
    },
  ])("duration: $name", async ({ startTime, endTime, allowed }) => {
    const ctx = createTestContext();

    const promise = ctx.service.createReservation(
      createInput({
        startTime,
        endTime,
      }),

      USER_A,
    );

    if (allowed) {
      await expect(promise).resolves.toMatchObject({
        status: "CONFIRMED",
      });
    } else {
      await expect(promise).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    }
  });

  test("started reservation cannot be cancelled", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T10:00:00.000Z",

        endTime: "2035-01-01T11:00:00.000Z",
      }),

      USER_A,
    );

    ctx.setNow("2035-01-01T10:30:00.000Z");

    await expect(
      ctx.service.cancelReservation(reservation.id, USER_A),
    ).rejects.toMatchObject({
      code: "RESERVATION_ALREADY_STARTED",
    });
  });

  test("double cancellation is idempotent and keeps cancelledAt", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_A,
    );

    const first = await ctx.service.cancelReservation(reservation.id, USER_A);

    const firstCancelledAt = new Date(first.cancelledAt).toISOString();

    ctx.setNow("2035-01-01T09:00:00.000Z");

    const second = await ctx.service.cancelReservation(reservation.id, USER_A);

    expect(second.status).toBe("CANCELLED");

    expect(new Date(second.cancelledAt).toISOString()).toBe(firstCancelledAt);
  });

  test("foreign USER cannot read another user's reservation", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_B,
    );

    await expect(
      ctx.service.getReservationById(reservation.id, USER_A),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  test("ADMIN can read another user's reservation", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_B,
    );

    const result = await ctx.service.getReservationById(reservation.id, ADMIN);

    expect(result.id).toBe(reservation.id);
  });

  test("foreign USER cannot cancel another user's reservation", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_B,
    );

    await expect(
      ctx.service.cancelReservation(reservation.id, USER_A),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  test("ADMIN can cancel another user's reservation", async () => {
    const ctx = createTestContext();

    const reservation = await ctx.service.createReservation(
      createInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_B,
    );

    const result = await ctx.service.cancelReservation(reservation.id, ADMIN);

    expect(result.status).toBe("CANCELLED");

    expect(result.cancelledAt).not.toBeNull();
  });
});

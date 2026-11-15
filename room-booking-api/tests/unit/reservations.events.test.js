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

function createContext() {
  const roomsRepository = createInMemoryRoomsRepository();

  const reservationsRepository = createInMemoryReservationsRepository();

  const eventBus = {
    publish: jest.fn(),
  };

  const runInTransaction = async (fn) =>
    fn({
      rooms: roomsRepository,
      reservations: reservationsRepository,
    });

  const service = createReservationsService({
    roomsRepository,
    reservationsRepository,
    runInTransaction,

    eventBus,

    now: () => new Date("2035-01-01T08:00:00.000Z"),
  });

  return {
    service,
    eventBus,
  };
}

function reservationInput({
  startTime = "2035-01-01T10:00:00.000Z",

  endTime = "2035-01-01T12:00:00.000Z",
} = {}) {
  return {
    roomId: 1,
    participants: 5,
    startTime,
    endTime,
  };
}

describe("reservation events", () => {
  test("publishes reservation.created after successful creation", async () => {
    const ctx = createContext();

    const reservation = await ctx.service.createReservation(
      reservationInput(),
      USER_A,
    );

    expect(ctx.eventBus.publish).toHaveBeenCalledTimes(1);

    expect(ctx.eventBus.publish).toHaveBeenCalledWith("reservation.created", {
      reservationId: reservation.id,

      roomId: 1,

      userId: USER_A.id,

      startTime: "2035-01-01T10:00:00.000Z",

      endTime: "2035-01-01T12:00:00.000Z",
    });
  });

  test("does not publish event when reservation creation fails", async () => {
    const ctx = createContext();

    await ctx.service.createReservation(reservationInput(), USER_A);

    ctx.eventBus.publish.mockClear();

    await expect(
      ctx.service.createReservation(
        reservationInput({
          startTime: "2035-01-01T11:00:00.000Z",

          endTime: "2035-01-01T13:00:00.000Z",
        }),

        USER_B,
      ),
    ).rejects.toMatchObject({
      code: "ROOM_ALREADY_BOOKED",
    });

    expect(ctx.eventBus.publish).not.toHaveBeenCalled();
  });

  test("second cancellation does not publish another event", async () => {
    const ctx = createContext();

    const reservation = await ctx.service.createReservation(
      reservationInput({
        startTime: "2035-01-01T12:00:00.000Z",

        endTime: "2035-01-01T13:00:00.000Z",
      }),

      USER_A,
    );

    ctx.eventBus.publish.mockClear();

    await ctx.service.cancelReservation(reservation.id, USER_A);

    expect(ctx.eventBus.publish).toHaveBeenCalledTimes(1);

    expect(ctx.eventBus.publish).toHaveBeenCalledWith(
      "reservation.cancelled",
      expect.objectContaining({
        reservationId: reservation.id,

        userId: USER_A.id,

        cancelledBy: USER_A.id,
      }),
    );

    ctx.eventBus.publish.mockClear();

    await ctx.service.cancelReservation(reservation.id, USER_A);

    expect(ctx.eventBus.publish).not.toHaveBeenCalled();
  });
});

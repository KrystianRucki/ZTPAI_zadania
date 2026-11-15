const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require("../../errors/AppError");

const MIN_DURATION_MS = 15 * 60 * 1000;

const MAX_DURATION_MS = 8 * 60 * 60 * 1000;

const noopEventBus = {
  publish() {},
};

function createReservationsService({
  roomsRepository,
  reservationsRepository,
  runInTransaction,
  eventBus = noopEventBus,
  now = () => new Date(),
}) {
  async function getAllReservations(query, currentUser) {
    if (currentUser.role === "USER" && query.userId !== undefined) {
      throw new ForbiddenError("Only ADMIN can filter reservations by userId");
    }

    const effectiveQuery = {
      ...query,
    };

    if (currentUser.role === "USER") {
      effectiveQuery.userId = currentUser.id;
    }

    const { items, total } =
      await reservationsRepository.findAllDetailed(effectiveQuery);

    return {
      items,

      meta: {
        page: effectiveQuery.page,
        limit: effectiveQuery.limit,
        total,
        totalPages: Math.ceil(total / effectiveQuery.limit),
      },
    };
  }

  async function getReservationById(id, currentUser) {
    const reservation = await reservationsRepository.findDetailedById(id);

    if (!reservation) {
      throw new NotFoundError("Reservation");
    }

    const isOwner = reservation.user.id === currentUser.id;

    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new NotFoundError("Reservation");
    }

    return reservation;
  }

  async function createReservation(input, currentUser) {
    const reservation = await runInTransaction(
      async ({ rooms, reservations }) => {
        const room = await rooms.lockById(input.roomId);

        if (!room) {
          throw new NotFoundError("Room");
        }

        if (input.participants > room.capacity) {
          throw new ConflictError(
            "Room capacity exceeded",
            "ROOM_CAPACITY_EXCEEDED",
          );
        }

        const startTime = new Date(input.startTime);

        const endTime = new Date(input.endTime);

        const currentTime = now();

        const start = startTime.getTime();

        const end = endTime.getTime();

        const current = currentTime.getTime();

        const validationErrors = [];

        if (end <= start) {
          validationErrors.push({
            location: "body",
            field: "endTime",
            message: "endTime must be later than startTime",
          });
        }

        const duration = end - start;

        if (end > start && duration < MIN_DURATION_MS) {
          validationErrors.push({
            location: "body",
            field: "endTime",
            message: "Reservation must last at least 15 minutes",
          });
        }

        if (end > start && duration > MAX_DURATION_MS) {
          validationErrors.push({
            location: "body",
            field: "endTime",
            message: "Reservation cannot last longer than 8 hours",
          });
        }

        if (start < current) {
          validationErrors.push({
            location: "body",
            field: "startTime",
            message: "startTime cannot be in the past",
          });
        }

        if (validationErrors.length > 0) {
          throw new ValidationError(validationErrors);
        }

        const disableAppCheck =
          process.env.DISABLE_APP_OVERLAP_CHECK === "true";

        if (!disableAppCheck) {
          const roomReservations = await reservations.findByRoomId(
            input.roomId,
          );

          const overlapping = roomReservations.some((reservation) => {
            if (reservation.status !== "CONFIRMED") {
              return false;
            }

            const existingStart = new Date(reservation.startTime).getTime();

            const existingEnd = new Date(reservation.endTime).getTime();

            return start < existingEnd && existingStart < end;
          });

          if (overlapping) {
            throw new ConflictError(
              "Room is already booked in this time range",
              "ROOM_ALREADY_BOOKED",
            );
          }
        }

        return reservations.create({
          roomId: input.roomId,

          userId: currentUser.id,

          participants: input.participants,

          startTime,

          endTime,

          status: "CONFIRMED",

          createdAt: currentTime,

          cancelledAt: null,
        });
      },
    );

    eventBus.publish("reservation.created", {
      reservationId: reservation.id,

      roomId: reservation.roomId,

      userId: currentUser.id,

      startTime: new Date(reservation.startTime).toISOString(),

      endTime: new Date(reservation.endTime).toISOString(),
    });

    return reservation;
  }

  async function cancelReservation(id, currentUser) {
    const result = await runInTransaction(async ({ reservations }) => {
      const reservation = await reservations.findById(id);

      if (!reservation) {
        throw new NotFoundError("Reservation");
      }

      const isOwner = reservation.user.id === currentUser.id;

      const isAdmin = currentUser.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new NotFoundError("Reservation");
      }

      if (reservation.status === "CANCELLED") {
        return {
          reservation,
          shouldPublish: false,
        };
      }

      const currentTime = now();

      if (new Date(reservation.startTime).getTime() <= currentTime.getTime()) {
        throw new ConflictError(
          "Reservation has already started",
          "RESERVATION_ALREADY_STARTED",
        );
      }

      const updatedReservation = await reservations.update({
        ...reservation,

        status: "CANCELLED",

        cancelledAt: currentTime,
      });

      return {
        reservation: updatedReservation,

        shouldPublish: true,
      };
    });

    if (result.shouldPublish) {
      eventBus.publish("reservation.cancelled", {
        reservationId: result.reservation.id,

        roomId: result.reservation.roomId,

        userId: result.reservation.user.id,

        cancelledBy: currentUser.id,
      });
    }

    return result.reservation;
  }

  return {
    getAllReservations,
    getReservationById,
    createReservation,
    cancelReservation,
  };
}

module.exports = {
  createReservationsService,
};

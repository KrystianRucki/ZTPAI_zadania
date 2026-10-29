const {
  NotFoundError,
  ConflictError,
  ValidationError,
} = require("../../errors/AppError");

const MIN_DURATION_MS = 15 * 60 * 1000;

const MAX_DURATION_MS = 8 * 60 * 60 * 1000;

const ALLOWED_TRANSITIONS = {
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

function createReservationsService({
  roomsRepository,
  reservationsRepository,
  runInTransaction,
  now = () => new Date(),
}) {
  async function getAllReservations(query) {
    const { items, total } =
      await reservationsRepository.findAllDetailed(query);

    return {
      items,

      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async function getReservationById(id) {
    const reservation = await reservationsRepository.findDetailedById(id);

    if (!reservation) {
      throw new NotFoundError("Reservation");
    }

    return reservation;
  }

  async function createReservation(input) {
    return runInTransaction(async ({ rooms, reservations }) => {
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

      const roomReservations = await reservations.findByRoomId(input.roomId);

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

      return reservations.create({
        roomId: input.roomId,
        reservedBy: input.reservedBy,
        participants: input.participants,
        startTime,
        endTime,
        status: "CONFIRMED",
        createdAt: currentTime,
        cancelledAt: null,
      });
    });
  }

  async function cancelReservation(id) {
    const reservation = await reservationsRepository.findById(id);

    if (!reservation) {
      throw new NotFoundError("Reservation");
    }

    if (reservation.status === "CANCELLED") {
      return reservation;
    }

    const targetStatus = "CANCELLED";

    const allowedTransitions = ALLOWED_TRANSITIONS[reservation.status] ?? [];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new ConflictError(
        "Invalid reservation status transition",
        "INVALID_STATUS_TRANSITION",
      );
    }

    const currentTime = now();

    if (new Date(reservation.startTime).getTime() <= currentTime.getTime()) {
      throw new ConflictError(
        "Reservation has already started",
        "RESERVATION_ALREADY_STARTED",
      );
    }

    reservation.status = "CANCELLED";

    reservation.cancelledAt = currentTime;

    await reservationsRepository.update(reservation);

    return reservation;
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

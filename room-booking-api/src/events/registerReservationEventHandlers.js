function registerReservationEventHandlers({
  eventBus,
  auditRepository,
  usersRepository,
  logger = console,
}) {
  eventBus.on("reservation.created", async (payload) => {
    await auditRepository.create({
      eventType: "reservation.created",
      payload,
    });
  });

  eventBus.on("reservation.cancelled", async (payload) => {
    await auditRepository.create({
      eventType: "reservation.cancelled",
      payload,
    });
  });

  eventBus.on("reservation.cancelled", async (payload) => {
    if (payload.cancelledBy === payload.userId) {
      return;
    }

    const [owner, cancelledByUser] = await Promise.all([
      usersRepository.findById(payload.userId),

      usersRepository.findById(payload.cancelledBy),
    ]);

    if (!owner || !cancelledByUser || cancelledByUser.role !== "ADMIN") {
      return;
    }

    logger.log(
      `[notification] to: ${owner.email} reservation ${payload.reservationId} cancelled by ADMIN`,
    );
  });
}

module.exports = {
  registerReservationEventHandlers,
};

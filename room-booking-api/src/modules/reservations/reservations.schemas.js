const { z } = require("zod");

const idParams = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

const createReservationBody = z
  .object({
    roomId: z.number().int().positive(),

    reservedBy: z.string().trim().min(2).max(100),

    participants: z.number().int().positive(),

    startTime: z.string().datetime({
      offset: true,
    }),

    endTime: z.string().datetime({
      offset: true,
    }),
  })
  .strict();

const listReservationsQuery = z
  .object({
    roomId: z.coerce.number().int().positive().optional(),

    buildingId: z.coerce.number().int().positive().optional(),

    status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),

    from: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    to: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z
      .enum([
        "startTime",
        "-startTime",
        "createdAt",
        "-createdAt",
        "participants",
        "-participants",
      ])
      .default("startTime"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.from &&
      data.to &&
      new Date(data.from).getTime() >= new Date(data.to).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "to must be later than from",
      });
    }
  });

module.exports = {
  idParams,
  createReservationBody,
  listReservationsQuery,
};

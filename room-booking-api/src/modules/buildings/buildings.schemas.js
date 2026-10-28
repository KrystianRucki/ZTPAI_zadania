const { z } = require("zod");

const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

const createBuildingBody = z
  .object({
    name: z.string().trim().min(2).max(120),

    address: z.string().trim().min(3).max(255),
  })
  .strict();

module.exports = {
  idParams,
  createBuildingBody,
};

function toUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function createKnexUsersRepository(db) {
  return {
    async findById(id) {
      const row = await db("users").where({ id }).first();

      return toUser(row);
    },

    async findByEmail(email) {
      const row = await db("users").where({ email }).first();

      return toUser(row);
    },

    async create({ email, passwordHash, role }) {
      const [row] = await db("users")
        .insert({
          email,
          password_hash: passwordHash,
          role,
        })
        .returning("*");

      return toUser(row);
    },
  };
}

module.exports = {
  createKnexUsersRepository,
};

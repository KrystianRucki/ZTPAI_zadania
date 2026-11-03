const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex.raw(`
    TRUNCATE users
    RESTART IDENTITY
    CASCADE
  `);

  const passwordHash = await bcrypt.hash("admin-password-123", 12);

  await knex("users").insert({
    email: "admin@example.com",
    password_hash: passwordHash,
    role: "ADMIN",
  });
};

const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

exports.seed = async function (knex) {
  await knex.raw(`
    TRUNCATE users
    RESTART IDENTITY
    CASCADE
  `);

  const users = [
    {
      email: "admin@example.com",
      password: "admin-password-123",
      role: "ADMIN",
    },
    {
      email: "jan.kowalski@example.com",
      password: "user-password-123",
      role: "USER",
    },
    {
      email: "anna.nowak@example.com",
      password: "user-password-123",
      role: "USER",
    },
    {
      email: "piotr.nowak@example.com",
      password: "user-password-123",
      role: "USER",
    },
    {
      email: "adam.kowalski@example.com",
      password: "user-password-123",
      role: "USER",
    },
    {
      email: "maria.nowak@example.com",
      password: "user-password-123",
      role: "USER",
    },
  ];

  const rows = [];

  for (const user of users) {
    rows.push({
      email: user.email,

      password_hash: await bcrypt.hash(user.password, BCRYPT_ROUNDS),

      role: user.role,
    });
  }

  await knex("users").insert(rows);
};

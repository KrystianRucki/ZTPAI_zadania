exports.up = async function (knex) {
  await knex.schema.alterTable("reservations", (table) => {
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
  });

  await knex.raw(`
    UPDATE reservations AS r
    SET user_id = u.id
    FROM users AS u
    WHERE u.email =
      CASE r.reserved_by
        WHEN 'Jan Kowalski'
          THEN 'jan.kowalski@example.com'
        WHEN 'Anna Nowak'
          THEN 'anna.nowak@example.com'
        WHEN 'Piotr Nowak'
          THEN 'piotr.nowak@example.com'
        WHEN 'Adam Kowalski'
          THEN 'adam.kowalski@example.com'
        WHEN 'Maria Nowak'
          THEN 'maria.nowak@example.com'
      END
  `);

  const result = await knex("reservations")
    .whereNull("user_id")
    .count({
      count: "*",
    })
    .first();

  if (Number(result.count) > 0) {
    throw new Error(
      "Cannot migrate reservations: some rows could not be assigned to users",
    );
  }

  await knex.raw(`
    ALTER TABLE reservations
    ALTER COLUMN user_id
    SET NOT NULL
  `);

  await knex.schema.alterTable("reservations", (table) => {
    table.index(["user_id"], "reservations_user_id_idx");

    table.dropColumn("reserved_by");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("reservations", (table) => {
    table.string("reserved_by", 100);
  });

  await knex.raw(`
    UPDATE reservations AS r
    SET reserved_by =
      CASE u.email
        WHEN 'jan.kowalski@example.com'
          THEN 'Jan Kowalski'
        WHEN 'anna.nowak@example.com'
          THEN 'Anna Nowak'
        WHEN 'piotr.nowak@example.com'
          THEN 'Piotr Nowak'
        WHEN 'adam.kowalski@example.com'
          THEN 'Adam Kowalski'
        WHEN 'maria.nowak@example.com'
          THEN 'Maria Nowak'
        ELSE u.email
      END
    FROM users AS u
    WHERE u.id = r.user_id
  `);

  await knex.raw(`
    ALTER TABLE reservations
    ALTER COLUMN reserved_by
    SET NOT NULL
  `);

  await knex.schema.alterTable("reservations", (table) => {
    table.dropIndex(["user_id"], "reservations_user_id_idx");

    table.dropColumn("user_id");
  });
};

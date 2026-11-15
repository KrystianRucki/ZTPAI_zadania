exports.up = async function (knex) {
  await knex.schema.createTable("audit_log", (table) => {
    table.bigIncrements("id").primary();

    table.string("event_type", 100).notNullable();

    table.jsonb("payload").notNullable();

    table
      .timestamp("created_at", {
        useTz: true,
      })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["event_type"], "audit_log_event_type_idx");

    table.index(["created_at"], "audit_log_created_at_idx");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("audit_log");
};

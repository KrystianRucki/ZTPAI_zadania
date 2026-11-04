exports.seed = async function (knex) {
  await knex.raw(`
    TRUNCATE
      reservations,
      rooms,
      buildings
    RESTART IDENTITY
    CASCADE
  `);

  await knex("buildings").insert([
    {
      name: "Budynek A",
      address: "ul. Warszawska 24, Kraków",
    },
    {
      name: "Budynek B",
      address: "ul. Długa 10, Kraków",
    },
  ]);

  await knex("rooms").insert([
    {
      building_id: 1,
      name: "101",
      capacity: 30,
    },
    {
      building_id: 1,
      name: "102",
      capacity: 20,
    },
    {
      building_id: 1,
      name: "201",
      capacity: 50,
    },
    {
      building_id: 2,
      name: "101",
      capacity: 15,
    },
    {
      building_id: 2,
      name: "301",
      capacity: 40,
    },
  ]);

  await knex("reservations").insert([
    {
      room_id: 1,
      user_id: 2,
      participants: 10,
      start_time: "2026-10-20T10:00:00Z",
      end_time: "2026-10-20T12:00:00Z",
      status: "CONFIRMED",
      cancelled_at: null,
      created_at: "2026-10-19T08:00:00Z",
    },
    {
      room_id: 1,
      user_id: 3,
      participants: 12,
      start_time: "2026-11-10T10:00:00Z",
      end_time: "2026-11-10T12:00:00Z",
      status: "CONFIRMED",
      cancelled_at: null,
      created_at: "2026-10-25T08:00:00Z",
    },
    {
      room_id: 2,
      user_id: 4,
      participants: 8,
      start_time: "2026-11-11T09:00:00Z",
      end_time: "2026-11-11T10:00:00Z",
      status: "CANCELLED",
      cancelled_at: "2026-10-26T10:00:00Z",
      created_at: "2026-10-24T08:00:00Z",
    },
    {
      room_id: 3,
      user_id: 5,
      participants: 25,
      start_time: "2026-11-12T14:00:00Z",
      end_time: "2026-11-12T16:00:00Z",
      status: "CONFIRMED",
      cancelled_at: null,
      created_at: "2026-10-25T09:00:00Z",
    },
    {
      room_id: 4,
      user_id: 6,
      participants: 10,
      start_time: "2026-11-13T08:00:00Z",
      end_time: "2026-11-13T09:00:00Z",
      status: "CONFIRMED",
      cancelled_at: null,
      created_at: "2026-10-25T11:00:00Z",
    },
  ]);
};

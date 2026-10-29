const db = require("../src/db/knex");

const API_URL = "http://localhost:3000/api/reservations";

const ROOM_ID = 5;

const START_TIME = "2026-12-20T10:00:00.000Z";

const END_TIME = "2026-12-20T12:00:00.000Z";

async function sendReservation(index) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        roomId: ROOM_ID,
        reservedBy: `Race Test ${index}`,
        participants: 5,
        startTime: START_TIME,
        endTime: END_TIME,
      }),
    });

    return {
      index,
      status: response.status,
    };
  } catch (error) {
    return {
      index,
      status: "ERROR",
      message: error.message,
    };
  }
}

async function countConfirmedReservations() {
  const result = await db("reservations")
    .where({
      room_id: ROOM_ID,
      status: "CONFIRMED",
    })
    .andWhere("end_time", ">", START_TIME)
    .andWhere("start_time", "<", END_TIME)
    .count({
      count: "*",
    })
    .first();

  return Number(result.count);
}

async function main() {
  console.log("Sending 10 parallel reservation requests...");

  const requests = [];

  for (let i = 1; i <= 10; i += 1) {
    requests.push(sendReservation(i));
  }

  const results = await Promise.all(requests);

  console.log();

  for (const result of results) {
    console.log(`Request ${result.index}: ${result.status}`);
  }

  const count = await countConfirmedReservations();

  console.log();
  console.log(`CONFIRMED overlapping reservations in DB: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });

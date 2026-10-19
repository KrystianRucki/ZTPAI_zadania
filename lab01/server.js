const express = require("express");

const app = express();

app.use(express.json());

const rooms = [
  {
    id: 1,
    name: "A101",
    capacity: 30,
  },
  {
    id: 2,
    name: "A102",
    capacity: 20,
  },
  {
    id: 3,
    name: "B201",
    capacity: 50,
  },
  {
    id: 4,
    name: "C301",
    capacity: 10,
  },
];

let reservations = [];

app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.get("/api/rooms/:id", (req, res) => {
  const id = Number(req.params.id);

  const room = rooms.find((room) => room.id === id);

  if (!room) {
    return res.status(404).json({
      message: "Room not found",
    });
  }

  res.json(room);
});

app.get("/api/reservations", (req, res) => {
  const { roomId } = req.query;

  if (roomId === undefined) {
    return res.json(reservations);
  }

  const id = Number(roomId);

  const result = reservations.filter((reservation) => {
    return reservation.roomId === id;
  });

  res.json(result);
});

app.post("/api/reservations", (req, res) => {
  const { roomId, reservedBy, participants, date } = req.body;

  if (!roomId) {
    return res.status(400).json({
      message: "roomId is required",
    });
  }

  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    return res.status(404).json({
      message: "Room not found",
    });
  }

  if (!reservedBy) {
    return res.status(400).json({
      message: "reservedBy is required",
    });
  }

  if (typeof participants !== "number" || participants <= 0) {
    return res.status(400).json({
      message: "participants must be a number greater than 0",
    });
  }

  if (participants > room.capacity) {
    return res.status(409).json({
      message: "Room capacity exceeded",
    });
  }

  if (!date) {
    return res.status(400).json({
      message: "date is required",
    });
  }

  const reservation = {
    id: reservations.length + 1,
    roomId: roomId,
    reservedBy: reservedBy,
    participants: participants,
    date: date,
    status: "CONFIRMED",
  };

  reservations.push(reservation);

  res.status(201).json(reservation);
});

app.patch("/api/reservations/:id/cancel", (req, res) => {
  const id = Number(req.params.id);

  const reservation = reservations.find((reservation) => {
    return reservation.id === id;
  });

  if (!reservation) {
    return res.status(404).json({
      message: "Reservation not found",
    });
  }

  if (reservation.status === "CANCELLED") {
    return res.json(reservation);
  }

  reservation.status = "CANCELLED";

  res.json(reservation);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

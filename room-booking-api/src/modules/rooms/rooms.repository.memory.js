function createInMemoryRoomsRepository() {
  const rooms = [
    {
      id: 1,
      buildingId: 1,
      name: "101",
      capacity: 30,
      createdAt: new Date(),
    },
    {
      id: 2,
      buildingId: 1,
      name: "102",
      capacity: 20,
      createdAt: new Date(),
    },
    {
      id: 3,
      buildingId: 1,
      name: "201",
      capacity: 50,
      createdAt: new Date(),
    },
    {
      id: 4,
      buildingId: 2,
      name: "101",
      capacity: 15,
      createdAt: new Date(),
    },
    {
      id: 5,
      buildingId: 2,
      name: "301",
      capacity: 40,
      createdAt: new Date(),
    },
  ];

  let nextId = 6;

  return {
    async findAll() {
      return [...rooms];
    },

    async findById(id) {
      return rooms.find((room) => room.id === id) ?? null;
    },

    async create(data) {
      const room = {
        id: nextId++,
        ...data,
        createdAt: new Date(),
      };

      rooms.push(room);

      return room;
    },
  };
}

module.exports = {
  createInMemoryRoomsRepository,
};

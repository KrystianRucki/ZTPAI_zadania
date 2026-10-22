function createInMemoryRoomsRepository() {
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

  return {
    async findAll() {
      return rooms;
    },

    async findById(id) {
      return rooms.find((room) => room.id === id) ?? null;
    },
  };
}

module.exports = {
  createInMemoryRoomsRepository,
};

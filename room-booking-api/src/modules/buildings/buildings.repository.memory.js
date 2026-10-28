function createInMemoryBuildingsRepository() {
  const buildings = [
    {
      id: 1,
      name: "Budynek A",
      address: "ul. Warszawska 24, Kraków",
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Budynek B",
      address: "ul. Długa 10, Kraków",
      createdAt: new Date(),
    },
  ];

  let nextId = 3;

  return {
    async findAll() {
      return [...buildings];
    },

    async findById(id) {
      return buildings.find((building) => building.id === id) ?? null;
    },

    async create(data) {
      const building = {
        id: nextId++,
        ...data,
        createdAt: new Date(),
      };

      buildings.push(building);

      return building;
    },
  };
}

module.exports = {
  createInMemoryBuildingsRepository,
};

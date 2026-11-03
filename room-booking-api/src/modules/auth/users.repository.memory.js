function createInMemoryUsersRepository() {
  const users = [];

  let nextId = 1;

  return {
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },

    async findByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },

    async create({ email, passwordHash, role }) {
      const user = {
        id: nextId++,
        email,
        passwordHash,
        role,
        createdAt: new Date(),
      };

      users.push(user);

      return user;
    },
  };
}

module.exports = {
  createInMemoryUsersRepository,
};

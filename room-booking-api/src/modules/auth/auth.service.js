const bcrypt = require("bcryptjs");

const { ConflictError } = require("../../errors/AppError");

const BCRYPT_ROUNDS = 12;

function createAuthService({ usersRepository }) {
  async function register({ email, password }) {
    const existing = await usersRepository.findByEmail(email);

    if (existing) {
      throw new ConflictError("Email already registered", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return usersRepository.create({
      email,
      passwordHash,

      role: "USER",
    });
  }

  return {
    register,
  };
}

module.exports = {
  createAuthService,
};

const jwt = require("jsonwebtoken");

const { UnauthorizedError } = require("../errors/AppError");

function createAuthenticate(jwtSecret) {
  return function authenticate(req, res, next) {
    const authorization = req.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return next(new UnauthorizedError());
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return next(new UnauthorizedError());
    }

    try {
      const payload = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
      });

      const userId = Number(payload.sub);

      if (
        !Number.isInteger(userId) ||
        userId <= 0 ||
        !["USER", "ADMIN"].includes(payload.role)
      ) {
        return next(new UnauthorizedError("Invalid token"));
      }

      req.user = {
        id: userId,
        role: payload.role,
      };

      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token expired"));
      }

      return next(new UnauthorizedError("Invalid token"));
    }
  };
}

module.exports = {
  createAuthenticate,
};

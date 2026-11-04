const { UnauthorizedError, ForbiddenError } = require("../errors/AppError");

function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    return next();
  };
}

module.exports = authorize;

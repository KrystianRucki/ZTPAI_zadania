const { AppError } = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  if (err.code === "23505") {
    return res.status(409).json({
      error: {
        code: "UNIQUE_VIOLATION",

        message: "Resource already exists",

        requestId: req.id,
      },
    });
  }

  if (err.code === "23P01") {
    return res.status(409).json({
      error: {
        code: "ROOM_ALREADY_BOOKED",

        message: "Room is already booked in this time range",

        requestId: req.id,
      },
    });
  }

  if (err instanceof AppError) {
    const error = {
      code: err.code,
      message: err.message,
      requestId: req.id,
    };

    if (err.details !== undefined) {
      error.details = err.details;
    }

    return res.status(err.statusCode).json({
      error,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",

        message: "Invalid JSON body",

        requestId: req.id,
      },
    });
  }

  console.error(`[${req.id}]`, err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",

      message: "Internal server error",

      requestId: req.id,
    },
  });
}

module.exports = errorHandler;

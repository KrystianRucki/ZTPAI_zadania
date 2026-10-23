const { ValidationError } = require("../errors/AppError");

function validate(schemas) {
  return (req, res, next) => {
    const validated = {};

    for (const part of ["params", "query", "body"]) {
      if (!schemas[part]) {
        continue;
      }

      const result = schemas[part].safeParse(req[part] ?? {});

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          location: part,
          field: issue.path.join("."),
          message: issue.message,
        }));

        return next(new ValidationError(details));
      }

      validated[part] = result.data;
    }

    req.validated = validated;

    next();
  };
}

module.exports = validate;

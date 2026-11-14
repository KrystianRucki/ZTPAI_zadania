process.env.NODE_ENV = "test";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/roombooking_test";

process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";

process.env.JWT_EXPIRES_IN = "15m";

process.env.REPOSITORY_MODE = "knex";

process.env.DISABLE_APP_OVERLAP_CHECK = "false";

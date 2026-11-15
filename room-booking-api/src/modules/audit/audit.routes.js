const express = require("express");

const validate = require("../../middleware/validate");

const { listAuditLogQuery } = require("./audit.schemas");

function createAuditRouter({ auditController }) {
  const router = express.Router();

  router.get(
    "/",
    validate({
      query: listAuditLogQuery,
    }),
    auditController.getAuditLog,
  );

  return router;
}

module.exports = {
  createAuditRouter,
};

function createAuditController({ auditService }) {
  async function getAuditLog(req, res) {
    const result = await auditService.getAuditLog(req.validated.query);

    res.status(200).json(result);
  }

  return {
    getAuditLog,
  };
}

module.exports = {
  createAuditController,
};

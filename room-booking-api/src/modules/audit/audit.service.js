function createAuditService({ auditRepository }) {
  async function getAuditLog(query) {
    const { items, total } = await auditRepository.findAll(query);

    return {
      data: items,

      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  return {
    getAuditLog,
  };
}

module.exports = {
  createAuditService,
};

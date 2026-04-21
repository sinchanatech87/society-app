const { AuditLog } = require('../models');

const audit = (entity, action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 400 && req.user) {
      const entityId = body?.id || req.params?.id || null;
      await AuditLog.create({
        entity,
        entity_id: entityId,
        action,
        performed_by: req.user.id
      }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};

module.exports = { audit };

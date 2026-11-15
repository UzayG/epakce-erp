// ============================================================================
// Middleware: CheckRole (Kullanıcı rol yetkilendirmesi)
// Rol uyuşmazlığında 403 Forbidden döner.
// ============================================================================

function CheckRole(...roles) {
  return function (req, res, next) {
    const userRole = req.user ? req.user.role : null;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: 'Bu işlem için yetkiniz yok.',
        gerekli_rol: roles,
        mevcut_rolunuz: userRole || 'misafir'
      });
    }

    next();
  };
}

module.exports = CheckRole;

/**
 * CheckRole Middleware
 * Directly mirrors the professor's Slide 03 code:
 *   abort_unless(
 *       in_array($request->user()?->role, $roles, true),
 *       403, 'Bu işlem için yetkiniz yok.'
 *   );
 * Usage: checkRole('admin') or checkRole('admin', 'editor')
 */
function checkRole(...roles) {
  return function (req, res, next) {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: 'Bu işlem için yetkiniz yok (Forbidden).',
        code: 403,
        required_roles: roles,
        your_role: userRole || 'guest'
      });
    }

    next();
  };
}

module.exports = checkRole;

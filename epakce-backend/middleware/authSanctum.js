const db = require('../db');

/**
 * AuthSanctum Middleware
 * Mimics Laravel Sanctum Bearer Token Authentication:
 *   Route::middleware(['auth:sanctum'])
 */
function authSanctum(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Kimlik doğrulanmadı (Unauthenticated). Lütfen "Authorization: Bearer <token>" başlığı gönderin.',
      error: 'token_missing'
    });
  }

  const token = authHeader.substring(7).trim();
  const user = db.prepare('SELECT id, name, email, role, api_token FROM users WHERE api_token = ?').get(token);

  if (!user) {
    return res.status(401).json({
      message: 'Geçersiz veya süresi dolmuş Sanctum API jetonu (Invalid token).',
      error: 'token_invalid'
    });
  }

  req.user = user;
  next();
}

module.exports = authSanctum;

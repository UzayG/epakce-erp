// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 3: Middleware - AuthSanctum
// Slayt 02'deki ->middleware(['auth:sanctum']) karşılığı.
// Authorization: Bearer <token> başlığını okur ve kullanıcının oturumunu doğrular.
// ============================================================================

const db = require('../../Models/Database');

function AuthSanctum(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Kimlik doğrulanmadı (Unauthenticated). Authorization: Bearer <token> gereklidir.'
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.prepare('SELECT id, name, email, role, api_token FROM users WHERE api_token = ?').get(token);

  if (!user) {
    return res.status(401).json({
      message: 'Geçersiz Sanctum tokeni.'
    });
  }

  req.user = user;
  next();
}

module.exports = AuthSanctum;

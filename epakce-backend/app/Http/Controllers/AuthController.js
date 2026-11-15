// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 5: Controller - AuthController
// Slayt 02:
//   Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
//   Route::get('/me', [AuthController::class, 'me']);
// ============================================================================

const db = require('../../Models/Database');

class AuthController {
  // POST /v1/login
  static login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(422).json({
        message: 'Giriş alanları eksik bırakılamaz.',
        errors: {
          email: !email ? ['E-posta adresi zorunludur.'] : [],
          password: !password ? ['Şifre alanı zorunludur.'] : []
        }
      });
    }

    const user = db.prepare('SELECT id, name, email, role, api_token FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        message: 'Kullanıcı bulunamadı veya şifre hatalı (401 Unauthorized).'
      });
    }

    return res.status(200).json({
      message: 'Giriş başarılı (Sanctum Token üretildi).',
      token_type: 'Bearer',
      access_token: user.api_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  // GET /v1/me (auth:sanctum ile korunur)
  static me(req, res) {
    return res.status(200).json({
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
}

module.exports = AuthController;

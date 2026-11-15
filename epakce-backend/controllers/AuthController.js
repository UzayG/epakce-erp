const db = require('../db');

class AuthController {
  // POST /api/v1/auth/login (Protected by throttle:5,1)
  static login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        message: 'Doğrulama hatası (Validation error).',
        errors: {
          email: !email ? ['E-posta alanı zorunludur.'] : [],
          password: !password ? ['Şifre alanı zorunludur.'] : []
        }
      });
    }

    const user = db.prepare('SELECT id, name, email, role, api_token FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        message: 'Girdiğiniz kimlik bilgileri kayıtlarımızla eşleşmiyor.',
        code: 401
      });
    }

    return res.status(200).json({
      message: 'Giriş başarılı (Authenticated via Sanctum).',
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

  // GET /api/v1/auth/me (Protected by auth:sanctum)
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

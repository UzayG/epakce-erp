const crypto = require('node:crypto');
const db = require('../db');

/**
 * EnsureApiKey Middleware
 * Directly mirrors the professor's Slide 03 code:
 *   $key = (string) $request->header('X-API-KEY');
 *   if (! hash_equals(config('services.partner.key'), $key)) {
 *       return response()->json(['message' => 'Geçersiz API anahtarı'], 401);
 *   }
 * Uses crypto.timingSafeEqual for constant-time comparison against timing attacks.
 */
function ensureApiKey(req, res, next) {
  const providedKey = req.header('X-API-KEY');

  if (!providedKey) {
    return res.status(401).json({
      message: 'Geçersiz veya eksik API anahtarı. "X-API-KEY" başlığı zorunludur.',
      hint: 'Test için: X-API-KEY: epakce_partner_live_8f3a9b'
    });
  }

  // Look up registered API keys from database
  const validKeyRow = db.prepare('SELECT * FROM api_keys WHERE is_active = 1 AND key = ?').get(providedKey);

  if (!validKeyRow) {
    return res.status(401).json({
      message: 'Geçersiz API anahtarı (Unauthorized API Key).',
      code: 401
    });
  }

  // Constant-time comparison verification (hash_equals / timingSafeEqual)
  const a = Buffer.from(providedKey);
  const b = Buffer.from(validKeyRow.key);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({
      message: 'Geçersiz API anahtarı (hash_equals doğrulama başarısız).'
    });
  }

  req.partner = validKeyRow;
  next();
}

module.exports = ensureApiKey;

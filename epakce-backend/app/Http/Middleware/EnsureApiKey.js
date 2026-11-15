// ============================================================================
// Middleware: EnsureApiKey (X-API-KEY kontrolü)
// Timing attack koruması için timingSafeEqual karşılaştırması kullanılır.
// ============================================================================

const crypto = require('node:crypto');
const db = require('../../Models/Database');

function EnsureApiKey(req, res, next) {
  const apiKey = req.header('X-API-KEY');

  if (!apiKey) {
    return res.status(401).json({
      message: 'Geçersiz API anahtarı. X-API-KEY başlığı eksik.',
      hata: 'api_key_bulunamadi'
    });
  }

  // Veritabanındaki kayıtlı anahtarı buluyoruz
  const keyRecord = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(apiKey);

  if (!keyRecord) {
    return res.status(401).json({
      message: 'Geçersiz API anahtarı.',
      hata: 'yetkisiz_erisim'
    });
  }

  // hash_equals / timingSafeEqual ile sabit süreli güvenli karşılaştırma
  const bufA = Buffer.from(apiKey);
  const bufB = Buffer.from(keyRecord.key);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return res.status(401).json({
      message: 'Geçersiz API anahtarı.'
    });
  }

  req.partner = keyRecord;
  next();
}

module.exports = EnsureApiKey;

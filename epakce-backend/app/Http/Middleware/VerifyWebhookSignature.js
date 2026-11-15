// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 3: Middleware - VerifyWebhookSignature
// Slayt 02: ->middleware('verify.signature')
// Harici ödeme webhook'larında HMAC imzasını doğrular.
// ============================================================================

const crypto = require('node:crypto');
const WEBHOOK_SECRET = 'epakce_webhook_gizli_anahtar';

function VerifyWebhookSignature(req, res, next) {
  const signature = req.header('X-Signature-SHA256');

  if (!signature) {
    return res.status(401).json({
      message: 'Eksik imza. Webhook isteklerinde X-Signature-SHA256 başlığı zorunludur.'
    });
  }

  const payload = JSON.stringify(req.body || {});
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const bufA = Buffer.from(signature);
  const bufB = Buffer.from(expectedSignature);

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return res.status(401).json({
      message: 'Geçersiz webhook HMAC imzası.'
    });
  }

  next();
}

module.exports = {
  VerifyWebhookSignature,
  WEBHOOK_SECRET
};

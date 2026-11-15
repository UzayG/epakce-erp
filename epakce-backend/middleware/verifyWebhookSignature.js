const crypto = require('node:crypto');

const WEBHOOK_SECRET = 'epakce_webhook_secret_2026';

/**
 * VerifyWebhookSignature Middleware
 * Mimics Laravel's VerifyWebhookSignature middleware:
 *   Route::post('/webhooks/payment', PaymentWebhookController::class)
 *       ->middleware('verify.signature');
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.header('X-Signature-SHA256');

  if (!signature) {
    return res.status(401).json({
      message: 'Eksik imza başlığı. Webhook çağrılarında "X-Signature-SHA256" gereklidir.',
      error: 'missing_signature'
    });
  }

  const payload = JSON.stringify(req.body || {});
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({
      message: 'Geçersiz webhook imzası (HMAC hash_equals doğrulaması başarısız).',
      error: 'invalid_signature'
    });
  }

  req.signatureVerified = true;
  next();
}

module.exports = {
  verifyWebhookSignature,
  WEBHOOK_SECRET
};

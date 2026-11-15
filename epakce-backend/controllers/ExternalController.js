const db = require('../db');

/**
 * ExternalController
 * Mimics Slide 02:
 *   Route::prefix('external')
 *       ->middleware(['api.key', 'throttle:partner'])
 *       ->group(function () {
 *           Route::get('/orders', [ExternalOrderController::class, 'index']);
 *           Route::post('/webhooks/payment', PaymentWebhookController::class)
 *               ->middleware('verify.signature');
 *       });
 */
class ExternalController {
  static getOrders(req, res) {
    const orders = db.prepare('SELECT * FROM external_orders ORDER BY created_at DESC').all();

    return res.status(200).json({
      partner: req.partner.client_name,
      authenticated_via: 'X-API-KEY (hash_equals verified)',
      rate_limit: `${req.partner.rate_limit}/minute`,
      data: orders
    });
  }

  static handlePaymentWebhook(req, res) {
    const { event, order_id, amount, status = 'paid' } = req.body;

    db.prepare(`
      INSERT INTO webhook_logs (event_name, payload, signature_valid)
      VALUES (?, ?, 1)
    `).run(event || 'payment.success', JSON.stringify(req.body));

    return res.status(200).json({
      status: 'success',
      message: 'Ödeme webhook bildirimi alındı ve HMAC imzası doğrulandı (200 OK).',
      order_id: order_id || 'ord_auto_1',
      processed_at: new Date().toISOString()
    });
  }
}

module.exports = ExternalController;

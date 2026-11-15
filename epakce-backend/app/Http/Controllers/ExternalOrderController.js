// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 5: Controller - ExternalOrderController
// Slayt 02:
//   Route::prefix('external')->middleware(['api.key', 'throttle:partner'])->group(...)
//   Route::get('/orders', [ExternalOrderController::class, 'index']);
//   Route::post('/webhooks/payment', PaymentWebhookController::class)->middleware('verify.signature');
// ============================================================================

const db = require('../../Models/Database');

class ExternalOrderController {
  // GET /v1/external/orders
  static index(req, res) {
    const orders = db.prepare('SELECT * FROM external_orders ORDER BY created_at DESC').all();

    return res.status(200).json({
      istemci_tipi: 'Dış Partner (X-API-KEY)',
      partner: req.partner.client_name,
      hiz_limiti: `${req.partner.rate_limit} istek/dk`,
      data: orders
    });
  }

  // POST /v1/external/orders (201 Created)
  static store(req, res) {
    const { product_id = 'val_2850', quantity = 1, customer_email = 'musteri@partner.com' } = req.body || {};
    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    const orderId = `ext_${Date.now()}`;
    const unitPrice = prod ? prod.lowest_price : 100;
    const total = unitPrice * Number(quantity);

    db.prepare(`
      INSERT INTO external_orders (id, partner_name, product_title, amount, status, created_at)
      VALUES (?, ?, ?, ?, 'onaylandi', datetime('now'))
    `).run(orderId, req.partner.client_name, prod ? prod.title : 'Epin Ürünü', total);

    return res.status(201).json({
      message: 'Dış sipariş başarıyla oluşturuldu ve veritabanına işlendi (201 Created).',
      data: {
        order_id: orderId,
        partner: req.partner.client_name,
        product: prod ? prod.title : 'Epin Ürünü',
        quantity: Number(quantity),
        amount: total,
        status: 'onaylandi',
        customer_email
      }
    });
  }

  // POST /v1/external/webhooks/payment (verify.signature ile korunur)
  static paymentWebhook(req, res) {
    const { siparis_no, tutar, durum = 'odendi' } = req.body || {};

    return res.status(200).json({
      durum: 'basarili',
      mesaj: 'Ödeme webhook bildirimi alındı ve HMAC imzası doğrulandı (200 OK).',
      siparis_no: siparis_no || 'siparis_123',
      tutar: tutar || 100,
      onay_zamani: new Date().toISOString()
    });
  }
}

module.exports = ExternalOrderController;

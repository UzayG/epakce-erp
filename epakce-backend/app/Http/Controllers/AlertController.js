// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Fiyat Alarmı Takip Controller (Akakçe Fiyat Takibi)
// ============================================================================

const db = require('../../Models/Database');

class AlertController {
  // GET /v1/alerts
  static index(req, res) {
    const alerts = db.prepare('SELECT * FROM price_alerts ORDER BY id DESC').all();
    return res.status(200).json({ data: alerts });
  }

  // POST /v1/alerts (201 Created)
  static store(req, res) {
    const { product_id, target_price } = req.body;

    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!prod) {
      return res.status(404).json({ message: 'Seçilen ürün bulunamadı.' });
    }

    const alertId = `alarm_${Date.now()}`;
    db.prepare(`
      INSERT INTO price_alerts (id, product_id, product_title, game_name, current_price, target_price, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(alertId, prod.id, prod.title, prod.game_name, prod.lowest_price, Number(target_price));

    const created = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(alertId);

    return res.status(201).json({
      message: 'Fiyat takip alarmı kuruldu (201 Created).',
      data: created
    });
  }

  // DELETE /v1/alerts/:id (200 OK)
  static destroy(req, res) {
    const { id } = req.params;
    db.prepare('DELETE FROM price_alerts WHERE id = ?').run(id);
    return res.status(200).json({ message: 'Alarm silindi.', id });
  }

  // PATCH /v1/alerts/:id/toggle (200 OK)
  static toggle(req, res) {
    const { id } = req.params;
    const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
    if (!alert) return res.status(404).json({ message: 'Alarm bulunamadı.' });

    const newStatus = alert.is_active ? 0 : 1;
    db.prepare('UPDATE price_alerts SET is_active = ? WHERE id = ?').run(newStatus, id);

    return res.status(200).json({
      message: `Alarm ${newStatus ? 'aktif' : 'pasif'} duruma getirildi.`,
      is_active: Boolean(newStatus)
    });
  }
}

module.exports = AlertController;

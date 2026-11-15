const db = require('../db');

class AlertController {
  static index(req, res) {
    const alerts = db.prepare('SELECT * FROM price_alerts ORDER BY id DESC').all();
    return res.status(200).json({ data: alerts });
  }

  static store(req, res) {
    const { product_id, target_price } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Seçilen ürün bulunamadı.', code: 404 });
    }

    const alertId = `alert_${Date.now()}`;
    db.prepare(`
      INSERT INTO price_alerts (
        id, product_id, product_title, game_name, current_price, target_price, is_active, created_date
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 'Bugün')
    `).run(alertId, product.id, product.title, product.game_name, product.lowest_price, Number(target_price));

    const created = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(alertId);

    return res.status(201).json({
      message: 'Fiyat takip alarmı kuruldu (201 Created).',
      data: created
    });
  }

  static destroy(req, res) {
    const { id } = req.params;
    db.prepare('DELETE FROM price_alerts WHERE id = ?').run(id);
    return res.status(200).json({ message: 'Alarm silindi.', id });
  }

  static toggle(req, res) {
    const { id } = req.params;
    const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alarm bulunamadı.' });
    }

    const newStatus = alert.is_active ? 0 : 1;
    db.prepare('UPDATE price_alerts SET is_active = ? WHERE id = ?').run(newStatus, id);

    return res.status(200).json({
      message: `Alarm durumu ${newStatus ? 'aktif' : 'pasif'} yapıldı.`,
      is_active: Boolean(newStatus)
    });
  }
}

module.exports = AlertController;

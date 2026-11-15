// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Kategori, Kupon ve Birim Hesaplayıcı Controller
// ============================================================================

const db = require('../../Models/Database');
const EpinPriceService = require('../Services/EpinPriceService');

class UtilityController {
  static categories(req, res) {
    const cats = db.prepare('SELECT * FROM categories ORDER BY item_count DESC').all();
    return res.status(200).json({ data: cats });
  }

  static coupons(req, res) {
    const coups = db.prepare('SELECT * FROM coupons ORDER BY id ASC').all();
    return res.status(200).json({ data: coups });
  }

  static calculate(req, res) {
    const { game = 'val', needed_amount = 0 } = req.query;
    const result = EpinPriceService.calculatePackEfficiency(game, needed_amount);
    return res.status(200).json(result);
  }
}

module.exports = UtilityController;

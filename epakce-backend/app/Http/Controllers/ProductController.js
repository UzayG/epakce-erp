// ============================================================================
// Epakçe REST API: ProductController
// REST Uç Noktaları: index (200), show (200), store (201), update (200), destroy (204)
// ============================================================================

const db = require('../../Models/Database');
const ProductResource = require('../Resources/ProductResource');

class ProductController {
  // GET /v1/products (200 OK)
  static index(req, res) {
    const { category, search, sort, page = 1, per_page = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.max(1, parseInt(per_page, 10) || 10);
    const offset = (pageNum - 1) * limit;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND game_id = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (title LIKE ? OR game_name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (sort === 'cheapest') {
      sql += ' ORDER BY lowest_price ASC';
    } else if (sort === 'discount') {
      sql += ' ORDER BY drop_percentage DESC';
    } else {
      sql += ' ORDER BY rating_count DESC';
    }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.count : 0;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);

    return res.status(200).json(
      ProductResource.collection(rows, { page: pageNum, perPage: limit, total }, '/api/v1/products')
    );
  }

  // GET /v1/products/{id} (200 OK veya 404)
  static show(req, res) {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı (404 Not Found).'
      });
    }

    const vendors = db.prepare('SELECT * FROM vendor_offers WHERE product_id = ? ORDER BY price ASC').all(id);
    const history = db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY order_index ASC').all(id);

    return res.status(200).json({
      data: ProductResource.toArray(product, vendors, history)
    });
  }

  // POST /v1/products (201 Created)
  static store(req, res) {
    const {
      id = `custom_${Date.now()}`,
      game_id = 'val',
      game_name = 'Valorant',
      title,
      description = '',
      lowest_price,
      highest_price,
      original_price
    } = req.body;

    const lowest = Number(lowest_price);
    const highest = Number(highest_price || lowest * 1.15);
    const orig = Number(original_price || lowest * 1.1);

    db.prepare(`
      INSERT INTO products (
        id, game_id, game_name, title, description, lowest_price, highest_price,
        original_price, vendor_count, unit_price_text, rating, rating_count, tags, is_price_drop, drop_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'Standart', 5.0, 1, '["Yeni"]', 0, 0)
    `).run(id, game_id, game_name, title, description, lowest, highest, orig);

    // Otomatik ilk satıcı teklifi
    db.prepare(`
      INSERT INTO vendor_offers (id, product_id, vendor_name, price, original_price, rating, review_count, delivery_speed, url)
      VALUES (?, ?, 'ByNoGame', ?, ?, 9.9, 10, 'Anında Teslimat', 'https://www.bynogame.com')
    `).run(`v_${Date.now()}`, id, lowest, orig);

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return res.status(201).json({
      message: 'Epin ürünü başarıyla eklendi (201 Created).',
      data: ProductResource.toArray(created)
    });
  }

  // PUT /v1/products/{id} (200 OK)
  static update(req, res) {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ message: 'Güncellenecek ürün bulunamadı.' });
    }

    const {
      title = existing.title,
      description = existing.description,
      lowest_price = existing.lowest_price
    } = req.body;

    db.prepare('UPDATE products SET title = ?, description = ?, lowest_price = ? WHERE id = ?')
      .run(title, description, Number(lowest_price), id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return res.status(200).json({
      message: 'Ürün başarıyla güncellendi.',
      data: ProductResource.toArray(updated)
    });
  }

  // DELETE /v1/products/{id} (204 No Content)
  // role:admin middleware ile korunur
  static destroy(req, res) {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ message: 'Silinecek ürün bulunamadı.' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    // Slayt 07: DELETE -> destroy -> 204 No Content
    return res.status(204).send();
  }
}

module.exports = ProductController;

const db = require('../db');
const ProductResource = require('../resources/ProductResource');

/**
 * ProductController
 * Thin controller following Slide 01 & 08:
 * "Controller ince kalmalı: Doğrulama FormRequest'te, iş kuralı Service'te, biçim Resource'ta."
 */
class ProductController {
  // GET /api/v1/products (REST Index) -> 200 OK
  static index(req, res) {
    const { category, search, sort, page = 1, per_page = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.max(1, parseInt(per_page, 10) || 10);
    const offset = (pageNum - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND game_id = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR game_name LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Sort order
    if (sort === 'cheapest') {
      query += ' ORDER BY lowest_price ASC';
    } else if (sort === 'discount') {
      query += ' ORDER BY drop_percentage DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY rating_count DESC';
    }

    // Total count for pagination meta
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow ? totalRow.count : 0;

    // Apply pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);

    return res.status(200).json(
      ProductResource.collection(
        rows,
        { page: pageNum, perPage: limit, total },
        '/api/v1/products'
      )
    );
  }

  // GET /api/v1/products/:id (REST Show) -> 200 OK or 404
  static show(req, res) {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({
        message: `ID "${id}" olan epin ürünü bulunamadı (Product not found).`,
        code: 404
      });
    }

    const vendors = db.prepare('SELECT * FROM vendor_offers WHERE product_id = ? ORDER BY price ASC').all(id);
    const priceHistory = db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY sort_order ASC').all(id);

    return res.status(200).json({
      data: ProductResource.toArray(product, vendors, priceHistory)
    });
  }

  // POST /api/v1/products (REST Store) -> 201 Created
  static store(req, res) {
    const {
      id = `custom_${Date.now()}`,
      game_id = 'val',
      game_name = 'Valorant',
      title,
      description = '',
      lowest_price,
      highest_price,
      original_price,
      unit_price_text = '0.17 TL / 1 VP'
    } = req.body;

    const lowest = Number(lowest_price);
    const highest = Number(highest_price || lowest * 1.15);
    const original = Number(original_price || lowest * 1.1);

    db.prepare(`
      INSERT INTO products (
        id, game_id, game_name, title, description,
        lowest_price, highest_price, original_price, vendor_count,
        in_stock, instant_delivery, unit_price_text, rating, rating_count, tags, is_price_drop, drop_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, 5.0, 1, '["Yeni"]', 0, 0)
    `).run(
      id, game_id, game_name, title, description,
      lowest, highest, original, unit_price_text
    );

    // Default vendor offer
    db.prepare(`
      INSERT INTO vendor_offers (
        id, product_id, vendor_name, price, original_price, rating, total_reviews, delivery_speed, url
      ) VALUES (?, ?, 'ByNoGame', ?, ?, 9.9, 100, 'Anında Teslimat', 'https://www.bynogame.com')
    `).run(`v_${Date.now()}`, id, lowest, original);

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return res.status(201).json({
      message: 'Epin ürünü başarıyla eklendi (201 Created).',
      data: ProductResource.toArray(created)
    });
  }

  // PUT /api/v1/products/:id (REST Update) -> 200 OK
  static update(req, res) {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        message: 'Güncellenecek ürün bulunamadı.',
        code: 404
      });
    }

    const {
      title = existing.title,
      description = existing.description,
      lowest_price = existing.lowest_price,
      original_price = existing.original_price
    } = req.body;

    db.prepare(`
      UPDATE products
      SET title = ?, description = ?, lowest_price = ?, original_price = ?
      WHERE id = ?
    `).run(title, description, Number(lowest_price), Number(original_price), id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return res.status(200).json({
      message: 'Ürün başarıyla güncellendi.',
      data: ProductResource.toArray(updated)
    });
  }

  // DELETE /api/v1/products/:id (REST Destroy) -> 204 No Content
  // Protected by CheckRole('admin')
  static destroy(req, res) {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        message: 'Silinecek ürün bulunamadı.',
        code: 404
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    // Standard REST DELETE returns 204 No Content
    return res.status(204).send();
  }
}

module.exports = ProductController;

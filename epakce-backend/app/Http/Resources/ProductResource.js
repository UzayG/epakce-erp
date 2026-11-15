// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 8: API Resource - ProductResource
// Slayt 01 & 05: "php artisan make:resource ProductResource"
// JSON yanıt: data, meta, links.
// Veritabanı sütun isimlerini istemciden gizler, temiz JSON çıktısı üretir.
// ============================================================================

class ProductResource {
  // Tek bir ürün için Resource dönüştürücü
  static toArray(product, vendors = [], history = []) {
    return {
      id: product.id,
      game: {
        id: product.game_id,
        name: product.game_name
      },
      title: product.title,
      description: product.description,
      pricing: {
        lowest_price: Number(product.lowest_price),
        highest_price: Number(product.highest_price),
        original_price: Number(product.original_price),
        unit_price: product.unit_price_text,
        is_discounted: Boolean(product.is_price_drop),
        discount_percentage: Number(product.drop_percentage)
      },
      seller_info: {
        vendor_count: Number(product.vendor_count),
        rating: Number(product.rating),
        review_count: Number(product.rating_count)
      },
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags || []),
      vendors: vendors.map(v => ({
        id: v.id,
        name: v.vendor_name,
        price: Number(v.price),
        original_price: Number(v.original_price),
        rating: Number(v.rating),
        reviews: Number(v.review_count),
        delivery: v.delivery_speed,
        perk: v.payment_perk,
        store_url: v.url
      })),
      price_history: history.map(h => ({
        month: h.month_name,
        price: Number(h.price)
      }))
    };
  }

  // Liste için Resource Koleksiyonu (Sayfalama meta & linkleri ile)
  static collection(products, meta = null, reqPath = '/api/v1/products') {
    const list = products.map(p => this.toArray(p));

    const response = {
      data: list
    };

    if (meta) {
      const totalPages = Math.ceil(meta.total / meta.perPage) || 1;
      response.meta = {
        current_page: meta.page,
        per_page: meta.perPage,
        total: meta.total,
        last_page: totalPages
      };
      response.links = {
        self: `${reqPath}?page=${meta.page}`,
        first: `${reqPath}?page=1`,
        last: `${reqPath}?page=${totalPages}`,
        prev: meta.page > 1 ? `${reqPath}?page=${meta.page - 1}` : null,
        next: meta.page < totalPages ? `${reqPath}?page=${meta.page + 1}` : null
      };
    }

    return response;
  }
}

module.exports = ProductResource;

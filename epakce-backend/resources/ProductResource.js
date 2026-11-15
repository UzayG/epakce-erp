/**
 * ProductResource & ResourceCollection
 * Directly mirrors Laravel's:
 *   php artisan make:resource ProductResource
 *   php artisan make:resource ProductCollection
 * Formats data cleanly so internal database structure is not leaked,
 * and packages standard pagination meta and links.
 */

class ProductResource {
  static toArray(product, vendors = [], priceHistory = []) {
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
        currency: 'TRY',
        symbol: 'TL',
        unit_price: product.unit_price_text,
        is_discounted: Boolean(product.is_price_drop),
        discount_percentage: Number(product.drop_percentage)
      },
      availability: {
        in_stock: Boolean(product.in_stock),
        instant_delivery: Boolean(product.instant_delivery),
        vendor_count: Number(product.vendor_count)
      },
      reviews: {
        rating: Number(product.rating),
        total_ratings: Number(product.rating_count)
      },
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags || []),
      vendors: vendors.map(v => ({
        id: v.id,
        store: v.vendor_name,
        price: Number(v.price),
        original_price: Number(v.original_price),
        rating: Number(v.rating),
        review_count: Number(v.total_reviews),
        delivery: v.delivery_speed,
        bonus: v.payment_bonus,
        badges: typeof v.badges === 'string' ? JSON.parse(v.badges || '[]') : v.badges,
        payment_methods: typeof v.payment_methods === 'string' ? JSON.parse(v.payment_methods || '[]') : v.payment_methods,
        url: v.url
      })),
      price_history: priceHistory.map(h => ({
        month: h.month_name,
        lowest_price: Number(h.price)
      }))
    };
  }

  static collection(products, paginationMeta = null, reqUrl = '/api/v1/products') {
    const data = products.map(p => this.toArray(p));

    const response = {
      data: data
    };

    if (paginationMeta) {
      response.meta = {
        current_page: paginationMeta.page,
        per_page: paginationMeta.perPage,
        total_items: paginationMeta.total,
        total_pages: Math.ceil(paginationMeta.total / paginationMeta.perPage)
      };

      response.links = {
        self: `${reqUrl}?page=${paginationMeta.page}`,
        first: `${reqUrl}?page=1`,
        last: `${reqUrl}?page=${Math.ceil(paginationMeta.total / paginationMeta.perPage)}`,
        prev: paginationMeta.page > 1 ? `${reqUrl}?page=${paginationMeta.page - 1}` : null,
        next: paginationMeta.page < Math.ceil(paginationMeta.total / paginationMeta.perPage) ? `${reqUrl}?page=${paginationMeta.page + 1}` : null
      };
    }

    return response;
  }
}

module.exports = ProductResource;

// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 4: FormRequest - StoreAlertRequest
// Fiyat alarmı kurma doğrulaması (422 JSON)
// ============================================================================

function StoreAlertRequest(req, res, next) {
  const { product_id, target_price } = req.body || {};
  const errors = {};

  if (!product_id || String(product_id).trim() === '') {
    errors.product_id = ['Takip edilecek ürün (product_id) seçilmelidir.'];
  }

  if (target_price === undefined || target_price === null || target_price === '') {
    errors.target_price = ['Hedef fiyat (target_price) belirtilmelidir.'];
  } else if (isNaN(Number(target_price)) || Number(target_price) <= 0) {
    errors.target_price = ['Hedef fiyat alanı geçerli bir sayı olmalıdır.'];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'Verilen veri doğrulanamadı.',
      errors: errors
    });
  }

  next();
}

module.exports = StoreAlertRequest;

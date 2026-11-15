// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 4: FormRequest - StoreProductRequest
// Slayt 01 & 05: "Doğrulama FormRequest'te, hata -> 422 JSON."
// Controller içine if-else doldurmak yerine doğrulama burada yapılır.
// ============================================================================

function StoreProductRequest(req, res, next) {
  const { title, lowest_price } = req.body || {};
  const errors = {};

  if (!title || String(title).trim() === '') {
    errors.title = ['Ürün başlığı (title) zorunludur.'];
  }

  if (lowest_price === undefined || lowest_price === null || lowest_price === '') {
    errors.lowest_price = ['En ucuz fiyat (lowest_price) zorunludur.'];
  } else if (isNaN(Number(lowest_price)) || Number(lowest_price) <= 0) {
    errors.lowest_price = ['Fiyat alanı pozitif bir sayı olmalıdır.'];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'Verilen veri doğrulanamadı (Doğrulama Hatası).',
      errors: errors
    });
  }

  next();
}

module.exports = StoreProductRequest;

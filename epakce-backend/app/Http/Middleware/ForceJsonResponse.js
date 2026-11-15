// ============================================================================
// Kürşat Güner - KB 206 Programlama
// Katman 3: Middleware - ForceJsonResponse
// bootstrap/app.php içindeki $m->api(prepend: [ForceJsonResponse::class]) karşılığı.
// İstek başlığına ve yanıta Content-Type: application/json zorunluluğu getirir.
// ============================================================================

function ForceJsonResponse(req, res, next) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
}

module.exports = ForceJsonResponse;

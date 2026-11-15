/**
 * ForceJsonResponse Middleware
 * Mimics Laravel 11's:
 *   $m->api(prepend: [ForceJsonResponse::class]);
 *   $e->shouldRenderJsonWhen(fn ($request) => $request->is('api/*'));
 */
function forceJsonResponse(req, res, next) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Powered-By', 'Epakce-API-Framework/1.0 (Laravel-Architecture)');
  next();
}

module.exports = forceJsonResponse;

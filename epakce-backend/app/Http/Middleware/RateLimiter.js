// ============================================================================
// Middleware: RateLimiter (İstek Hız Sınırlandırma)
// Sınır aşıldığında 429 Too Many Requests ve Retry-After başlığı döndürür.
// ============================================================================

const requestCounts = new Map();

function RateLimiter(limit = 60, windowSeconds = 60, prefix = 'api') {
  return function (req, res, next) {
    const clientKey = `${prefix}:${req.header('X-API-KEY') || (req.user ? req.user.id : null) || req.ip || 'client'}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let item = requestCounts.get(clientKey);
    if (!item || now > item.resetAt) {
      item = { count: 0, resetAt: now + windowMs };
      requestCounts.set(clientKey, item);
    }

    item.count++;
    const remaining = Math.max(0, limit - item.count);
    const retryAfter = Math.ceil((item.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(item.resetAt / 1000));

    if (item.count > limit) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: 'Hız sınırı aşıldı (Too Many Requests). Lütfen bekleyin.',
        limit: limit,
        remaining: 0,
        retry_after: retryAfter
      });
    }

    next();
  };
}

module.exports = {
  apiThrottle: RateLimiter(60, 60, 'api'),
  partnerThrottle: RateLimiter(300, 60, 'partner'),
  loginThrottle: RateLimiter(5, 60, 'login')
};

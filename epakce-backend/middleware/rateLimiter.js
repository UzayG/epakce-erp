/**
 * RateLimiter Middleware
 * Mimics Laravel's:
 *   RateLimiter::for('api', fn ($r) => Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));
 *   RateLimiter::for('partner', fn ($r) => Limit::perMinute(300)->by($r->header('X-API-KEY')));
 *   Route::middleware('throttle:5,1');
 */

const tracker = new Map();

function createRateLimiter(options = {}) {
  const limit = options.limit || 60;
  const windowMs = options.windowMs || 60 * 1000;
  const name = options.name || 'api';

  return function (req, res, next) {
    const key = `${name}:${req.header('X-API-KEY') || req.user?.id || req.ip || 'anonymous'}`;
    const now = Date.now();

    let record = tracker.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      tracker.set(key, record);
    }

    record.count++;
    const remaining = Math.max(0, limit - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > limit) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: 'İstek sınırı aşıldı (Rate limit exceeded).',
        limit: limit,
        remaining: 0,
        retry_after_seconds: retryAfter,
        window: `${windowMs / 1000} saniye`
      });
    }

    next();
  };
}

module.exports = {
  apiLimiter: createRateLimiter({ limit: 60, windowMs: 60 * 1000, name: 'api' }),
  partnerLimiter: createRateLimiter({ limit: 300, windowMs: 60 * 1000, name: 'partner' }),
  loginLimiter: createRateLimiter({ limit: 5, windowMs: 60 * 1000, name: 'login' })
};

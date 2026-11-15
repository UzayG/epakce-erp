/**
 * Terminable Middleware
 * Directly mirrors Laravel's Terminable Middleware:
 *   Runs after response is sent: terminate($request, $response)
 *   Used for access logging, telemetry, and performance tracking.
 */

function terminableLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `[Epakce Terminable] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms | Client: ${req.ip}`;
    // Store in global history buffer for inspection in the dashboard
    global.recentLogs = global.recentLogs || [];
    global.recentLogs.unshift({
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      auth: req.user ? `${req.user.name} (${req.user.role})` : req.partner ? req.partner.client_name : 'Anonim'
    });
    if (global.recentLogs.length > 50) global.recentLogs.pop();
  });

  next();
}

module.exports = terminableLogger;

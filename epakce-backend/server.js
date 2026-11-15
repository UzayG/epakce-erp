// ============================================================================
// Epakçe REST API & Web Sunucusu
// Mimari: 8 Katmanlı REST API (Routing, Middleware, FormRequest, Controller, Service, DB, Resource)
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('node:path');

const ForceJsonResponse = require('./app/Http/Middleware/ForceJsonResponse');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.DEFAULT_APP_PORT || 3000;

// CORS izni (Mobil ve Web istemcileri için)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Signature-SHA256']
}));

// Güvenlik Başlıkları (OWASP A05 & A02 Security Headers + HSTS)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// İstek gövdesi (10kb DoS saldırı korumalı JSON body parser)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Statik Web Sitesi & Test Paneli Dosyaları
app.use(express.static(path.join(__dirname, 'public')));

// Slayt 02: API rotalarına ForceJsonResponse middleware'ini ekliyoruz
app.use('/api', ForceJsonResponse);
app.use('/api/v1', apiRoutes);

// Slayt 02: shouldRenderJsonWhen -> /api ile başlayan bulunamayan isteklerde HTML yerine 404 JSON döndür
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      message: `Uç nokta bulunamadı: ${req.method} ${req.originalUrl}`,
      durum_kodu: 404,
      gecerli_surum: '/api/v1'
    });
  }
  next();
});

// Web Arayüzü İçin SPA Yönlendirmesi
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Hata Yakalama (Global Exception Handler) -> her zaman JSON
app.use((err, req, res, next) => {
  console.error('[Epakce Hata]:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Sunucu hatası oluştu (500 Internal Server Error).',
    kod: err.status || 500
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Epakçe API] Sunucu 3000 portunda başarıyla çalıştı.`);
  console.log(`[Epakçe API] Web Sitesi: http://localhost:${PORT}`);
  console.log(`[Epakçe API] API Rotası: http://localhost:${PORT}/api/v1/products`);
});

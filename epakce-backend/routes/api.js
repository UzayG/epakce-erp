// ============================================================================
// Epakçe REST API Rota Tanımlamaları (/api/v1)
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const ProductController = require('../app/Http/Controllers/ProductController');
const AuthController = require('../app/Http/Controllers/AuthController');
const ExternalOrderController = require('../app/Http/Controllers/ExternalOrderController');
const AlertController = require('../app/Http/Controllers/AlertController');
const UtilityController = require('../app/Http/Controllers/UtilityController');

// Middleware'ler
const { apiThrottle, partnerThrottle, loginThrottle } = require('../app/Http/Middleware/RateLimiter');
const AuthSanctum = require('../app/Http/Middleware/AuthSanctum');
const EnsureApiKey = require('../app/Http/Middleware/EnsureApiKey');
const CheckRole = require('../app/Http/Middleware/CheckRole');
const { VerifyWebhookSignature } = require('../app/Http/Middleware/VerifyWebhookSignature');

// FormRequest Doğrulayıcıları
const StoreProductRequest = require('../app/Http/Requests/StoreProductRequest');
const StoreAlertRequest = require('../app/Http/Requests/StoreAlertRequest');

// ----------------------------------------------------------------------------
// 1. HERKESE AÇIK ROTALAR (Public Routes)
// ----------------------------------------------------------------------------

// Giriş rotası (Slayt 02: throttle: 5,1 -> dakikada max 5 deneme)
router.post('/login', loginThrottle, AuthController.login);

// Epin listesi ve tekil ürün detay (Akakçe karşılaştırma motoru)
router.get('/products', apiThrottle, ProductController.index);
router.get('/products/:id', apiThrottle, ProductController.show);
router.get('/categories', apiThrottle, UtilityController.categories);
router.get('/coupons', apiThrottle, UtilityController.coupons);
router.get('/calculator', apiThrottle, UtilityController.calculate);

// Fiyat alarm takip rotaları
router.get('/alerts', apiThrottle, AlertController.index);
router.post('/alerts', apiThrottle, StoreAlertRequest, AlertController.store);
router.delete('/alerts/:id', apiThrottle, AlertController.destroy);
router.patch('/alerts/:id/toggle', apiThrottle, AlertController.toggle);

// ----------------------------------------------------------------------------
// 2. İÇ İSTEMCİLER: SANCTUM TOKEN KORUMALI ROTALAR
// Slayt 02: Route::middleware(['auth:sanctum', 'throttle:api'])
// ----------------------------------------------------------------------------
router.get('/me', AuthSanctum, apiThrottle, AuthController.me);

router.post(
  '/products',
  AuthSanctum,
  apiThrottle,
  StoreProductRequest,
  ProductController.store
);

router.put(
  '/products/:id',
  AuthSanctum,
  apiThrottle,
  StoreProductRequest,
  ProductController.update
);

// Slayt 02: Route::middleware('role:admin') -> Silme işlemi sadece admin rolüne açık
router.delete(
  '/products/:id',
  AuthSanctum,
  apiThrottle,
  CheckRole('admin'),
  ProductController.destroy
);

// ----------------------------------------------------------------------------
// 3. DIŞ ROTALAR: PARTNER SİSTEMLER (ByNoGame / Oyunfor API)
// Slayt 02: Route::prefix('external')->middleware(['api.key', 'throttle:partner'])
// ----------------------------------------------------------------------------
router.get(
  '/external/orders',
  EnsureApiKey,
  partnerThrottle,
  ExternalOrderController.index
);

router.post(
  '/external/orders',
  EnsureApiKey,
  partnerThrottle,
  ExternalOrderController.store
);

router.post(
  '/external/webhooks/payment',
  VerifyWebhookSignature,
  ExternalOrderController.paymentWebhook
);

// Admin Denetim Kayıtları (Slayt 02: Route::middleware('role:admin'))
router.get(
  '/admin/audit-logs',
  AuthSanctum,
  apiThrottle,
  CheckRole('admin'),
  (req, res) => {
    res.status(200).json({
      message: 'Admin yetkisi doğrulandı (200 OK).',
      user: req.user.name,
      role: req.user.role,
      logs: [
        { id: 1, action: 'Sistem başlatıldı', timestamp: new Date().toISOString() },
        { id: 2, action: 'SQLite veritabanı şeması yüklendi', timestamp: new Date().toISOString() }
      ]
    });
  }
);

// ----------------------------------------------------------------------------
// 4. SİSTEM VE API BİLGİ ROTASI
// ----------------------------------------------------------------------------
router.get('/system/info', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    platform: 'Epakçe Epin Fiyat Karşılaştırma API',
    endpoints: {
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      coupons: '/api/v1/coupons',
      calculator: '/api/v1/calculator',
      alerts: '/api/v1/alerts'
    }
  });
});

module.exports = router;

# Epakçe - Epin Fiyat Karşılaştırma & REST API (VS Code Rehberi)

Bu proje, oyun epinleri ve dijital kodlar için Akakçe tarzı fiyat karşılaştırması yapan REST API arka ucu ve web portalıdır.

---

## 🚀 VS Code ile Nasıl Açılır ve Çalıştırılır?

### 1. Adım: Projeyi VS Code ile Açma
1. Visual Studio Code uygulamasını açın.
2. Üst menüden **File (Dosya) > Open Folder... (Klasörü Aç...)** seçeneğine tıklayın.
3. İndirdiğiniz zip'i açtığınız klasörü seçip **Klasörü Aç** deyin.

### 2. Adım: Terminali Açma
- Klavyeden `Ctrl + \`` (veya `Ctrl + "`) tuşlarına basın ya da üst menüden **Terminal > New Terminal (Yeni Terminal)** seçin.

### 3. Adım: Bağımlılıkları Yükleme ve Başlatma
Terminal ekranına şu komutları yazıp Enter'a basın:

```bash
# 1. Gerekli kütüphaneleri yükleyin (express ve cors)
npm install

# 2. Sunucuyu başlatın
npm start
```

Sunucu başladığında terminalde şu çıktıyı göreceksiniz:
```
[Epakçe API] Sunucu 3000 portunda başarıyla çalıştı.
[Epakçe API] Rota: http://0.0.0.0:3000/api/v1/products
```

### 4. Adım: Tarayıcıda Görüntüleme
Tarayıcınızı (Chrome, Edge vb.) açıp şu adrese gidin:
👉 `http://localhost:3000`

---

## 📁 Dosya ve Mimari Yapısı

```
server/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # İstekleri karşılayan ince Controller katmanı
│   │   │   ├── ProductController.js      # Epin listeleme, detay ve filtreleme
│   │   │   ├── AuthController.js         # Kullanıcı girişi ve token üretimi
│   │   │   ├── ExternalOrderController.js# Dış partner entegrasyonu
│   │   │   ├── AlertController.js        # Fiyat alarmları
│   │   │   └── UtilityController.js      # Kategoriler, kuponlar, birim hesaplayıcı
│   │   ├── Middleware/           # Güvenlik ve istek filtreleme zinciri
│   │   │   ├── ForceJsonResponse.js      # Tüm yanıtlara JSON başlığı zorunluluğu
│   │   │   ├── RateLimiter.js            # İstek hız sınırlandırma (60/dk ve 300/dk)
│   │   │   ├── AuthSanctum.js            # Bearer token kimlik doğrulaması
│   │   │   ├── EnsureApiKey.js           # timingSafeEqual ile güvenli X-API-KEY kontrolü
│   │   │   └── CheckRole.js              # Rol bazlı yetkilendirme (admin/user)
│   │   ├── Requests/             # FormRequest doğrulama katmanı (Hatalıysa 422 JSON)
│   │   │   ├── StoreProductRequest.js
│   │   │   └── StoreAlertRequest.js
│   │   ├── Resources/            # API Resource çıktı biçimlendirici (data, meta, links)
│   │   │   └── ProductResource.js
│   │   └── Services/             # İş mantığı katmanı
│   │       └── EpinPriceService.js       # Birim fiyat ve tasarruf hesaplama servisi
│   └── Models/                   # Veritabanı modelleri
│       ├── Database.js           # SQLite veritabanı bağlantısı ve tablo şeması
│       └── epakce.sqlite         # SQLite veritabanı dosyası
├── routes/
│   └── api.js                    # Tüm /api/v1 rotalarının tanımlandığı dosya
├── public/
│   └── index.html                # Epin karşılaştırma web arayüzü
├── package.json                  # Proje bağımlılıkları ve çalıştırma komutları
└── server.js                     # Ana Express sunucu giriş noktası
```

---

## 📡 Başlıca REST API Uç Noktaları

| Metot | Uç Nokta | Açıklama |
|---|---|---|
| `GET` | `/api/v1/products` | Tüm epinlerin satıcı fiyatları ve en ucuz fiyat tespiti |
| `GET` | `/api/v1/products/:id` | Tekil ürün detayı ve 6 aylık fiyat geçmişi grafiği |
| `GET` | `/api/v1/categories` | Oyun kategorileri (Valorant, PUBG, Steam vb.) |
| `GET` | `/api/v1/coupons` | Epin siteleri indirim kuponları |
| `GET` | `/api/v1/calculator?game=val` | Birim fiyat karşılaştırma hesaplaması |
| `POST` | `/api/v1/alerts` | Fiyat alarmı kurma (FormRequest ile 422 doğrulamalı) |
| `POST` | `/api/v1/login` | Giriş yapma ve API Token alma |
| `GET` | `/api/v1/external/orders` | Dış partnerler için API anahtarı korumalı rota |

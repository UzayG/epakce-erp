const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const crypto = require('node:crypto');

const dbPath = path.join(__dirname, 'epakce.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_emoji TEXT NOT NULL,
    tag_color TEXT NOT NULL,
    popular_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lowest_price REAL NOT NULL,
    highest_price REAL NOT NULL,
    original_price REAL NOT NULL,
    vendor_count INTEGER DEFAULT 1,
    in_stock INTEGER DEFAULT 1,
    instant_delivery INTEGER DEFAULT 1,
    unit_price_text TEXT,
    rating REAL DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0,
    tags TEXT,
    is_price_drop INTEGER DEFAULT 0,
    drop_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendor_offers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    rating REAL DEFAULT 9.5,
    total_reviews INTEGER DEFAULT 0,
    delivery_speed TEXT,
    payment_bonus TEXT,
    badges TEXT,
    payment_methods TEXT,
    url TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    month_name TEXT NOT NULL,
    price REAL NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS price_alerts (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    game_name TEXT NOT NULL,
    current_price REAL NOT NULL,
    target_price REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT 'Bugün'
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    discount_title TEXT NOT NULL,
    details TEXT,
    min_spend TEXT,
    expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    api_token TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    role TEXT DEFAULT 'partner',
    is_active INTEGER DEFAULT 1,
    rate_limit INTEGER DEFAULT 300
  );

  CREATE TABLE IF NOT EXISTS external_orders (
    id TEXT PRIMARY KEY,
    partner_name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    payload TEXT,
    signature_valid INTEGER DEFAULT 1,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default users & api keys if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const adminToken = 'epakce_sanctum_admin_token_99182a';
  const userToken = 'epakce_sanctum_user_token_33719b';
  
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, api_token)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertUser.run('Admin', 'admin@epakce.com', 'hashed_pass_admin', 'admin', adminToken);
  insertUser.run('Kürşat Güner', 'kursat@epakce.com', 'hashed_pass_user', 'user', userToken);

  // Seed API Keys for External Partners
  const insertApiKey = db.prepare(`
    INSERT INTO api_keys (key, client_name, role, rate_limit)
    VALUES (?, ?, ?, ?)
  `);
  insertApiKey.run('epakce_partner_live_8f3a9b', 'ByNoGame Entegrasyon Servisi', 'partner', 300);
  insertApiKey.run('epakce_partner_test_112233', 'Oyunfor API Test Client', 'partner', 300);
}

// Seed categories if empty
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
if (catCount === 0) {
  const insertCat = db.prepare('INSERT INTO categories (id, name, icon_emoji, tag_color, popular_count) VALUES (?, ?, ?, ?, ?)');
  insertCat.run('all', 'Tümü', '🔥', '#0056B3', 48);
  insertCat.run('val', 'Valorant VP', '🎯', '#FF4655', 12);
  insertCat.run('pubg', 'PUBG Mobile UC', '🪖', '#F59E0B', 8);
  insertCat.run('steam', 'Steam Cüzdan', '🎮', '#171A21', 10);
  insertCat.run('lol', 'League of Legends', '⚔️', '#0096C7', 9);
  insertCat.run('roblox', 'Robux', '🧱', '#E11D48', 6);
  insertCat.run('fc25', 'EA FC 25 Points', '⚽', '#10B981', 5);
  insertCat.run('knight', 'Knight Online', '🛡️', '#8B5CF6', 4);
  insertCat.run('giftcard', 'Hediye Kartları', '🎁', '#06B6D4', 7);
}

// Seed products if empty
const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
if (prodCount === 0) {
  const initialProducts = [
    {
      id: 'val_2850',
      game_id: 'val',
      game_name: 'Valorant',
      title: 'Valorant 2850 VP (Türkiye)',
      description: 'Riot Games TR sunucularında geçerli resmi Valorant Points dijital kodu. Anında teslimat.',
      lowest_price: 484.90,
      highest_price: 569.00,
      original_price: 540.00,
      vendor_count: 6,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '0.170 TL / 1 VP',
      rating: 4.9,
      rating_count: 8420,
      tags: JSON.stringify(['En Çok Satan', 'Fiyatı Düşen', 'Popüler']),
      is_price_drop: 1,
      drop_percentage: 10,
      priceTrend: [
        { month: 'May', price: 540.0 },
        { month: 'Haz', price: 535.0 },
        { month: 'Tem', price: 520.0 },
        { month: 'Ağu', price: 510.0 },
        { month: 'Eyl', price: 499.0 },
        { month: 'Eki', price: 484.9 }
      ],
      vendors: [
        { id: 'v_byno_val', vendor_name: 'ByNoGame', price: 484.90, original_price: 530.00, rating: 9.9, total_reviews: 42800, delivery_speed: 'Anında Teslimat (SMS/Mail)', payment_bonus: '%2 Bonus Bakiye', badges: ['En Ucuz', 'Yetkili Satıcı', '3D Secure'], payment_methods: ['Papara', 'Kredi Kartı', 'Havale / EFT (-%2)'], url: 'https://www.bynogame.com' },
        { id: 'v_oyunfor_val', vendor_name: 'Oyunfor', price: 489.00, original_price: 540.00, rating: 9.8, total_reviews: 31200, delivery_speed: 'Anında Kod Teslimi', payment_bonus: '5 TL Cüzdan Puan', badges: ['Resmi Partner', '7/24 Canlı Destek'], payment_methods: ['Kredi Kartı', 'Papara', 'Ininal'], url: 'https://www.oyunfor.com' },
        { id: 'v_kopazar_val', vendor_name: 'Kopazar', price: 492.50, original_price: 545.00, rating: 9.7, total_reviews: 19400, delivery_speed: '1-2 Dakika', badges: ['Güvenli Ödeme'], payment_methods: ['Banka Kartı', 'Fast / EFT'], url: 'https://www.kopazar.com' },
        { id: 'v_klasgame_val', vendor_name: 'Klasgame', price: 495.00, original_price: 550.00, rating: 9.6, total_reviews: 15800, delivery_speed: 'Anında Teslimat', badges: ['Hızlı Teslim'], payment_methods: ['Kredi Kartı', 'Tosla', 'Papara'], url: 'https://www.klasgame.com' },
        { id: 'v_trendyol_val', vendor_name: 'Trendyol', price: 519.90, original_price: 560.00, rating: 9.5, total_reviews: 9800, delivery_speed: 'E-posta ile Kod', badges: ['Trendyol Güvencesi'], payment_methods: ['Kredi Kartı', 'Trendyol Cüzdan'], url: 'https://www.trendyol.com' }
      ]
    },
    {
      id: 'pubg_660',
      game_id: 'pubg',
      game_name: 'PUBG Mobile',
      title: 'PUBG Mobile 660 UC',
      description: 'PUBG Mobile oyuncu ID ile anında hesaba yüklenen orijinal Unknown Cash paketi.',
      lowest_price: 339.00,
      highest_price: 410.00,
      original_price: 380.00,
      vendor_count: 5,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '0.513 TL / 1 UC',
      rating: 4.8,
      rating_count: 11200,
      tags: JSON.stringify(['En Çok Satan', 'ID Yükleme']),
      is_price_drop: 1,
      drop_percentage: 11,
      priceTrend: [
        { month: 'May', price: 390.0 },
        { month: 'Haz', price: 380.0 },
        { month: 'Tem', price: 370.0 },
        { month: 'Ağu', price: 355.0 },
        { month: 'Eyl', price: 345.0 },
        { month: 'Eki', price: 339.0 }
      ],
      vendors: [
        { id: 'v_oyunfor_pubg', vendor_name: 'Oyunfor', price: 339.00, original_price: 380.00, rating: 9.8, total_reviews: 28900, delivery_speed: 'Otomatik ID Yükleme (1 Dk)', payment_bonus: '%1 Cüzdan İade', badges: ['En Ucuz', 'Yetkili Yükleyici'], payment_methods: ['Papara', 'Kredi Kartı', 'Havale'], url: 'https://www.oyunfor.com' },
        { id: 'v_byno_pubg', vendor_name: 'ByNoGame', price: 342.00, original_price: 385.00, rating: 9.9, total_reviews: 39000, delivery_speed: 'Anında Oyuncu ID Yüklemesi', payment_bonus: '3 TL Hediye', badges: ['Resmi Partner'], payment_methods: ['Kredi Kartı', 'Papara'], url: 'https://www.bynogame.com' },
        { id: 'v_klas_pubg', vendor_name: 'Klasgame', price: 348.50, original_price: 390.00, rating: 9.6, total_reviews: 11400, delivery_speed: '1-3 Dakika', badges: ['Güvenli'], payment_methods: ['Kredi Kartı', 'Havale'], url: 'https://www.klasgame.com' }
      ]
    },
    {
      id: 'steam_100',
      game_id: 'steam',
      game_name: 'Steam',
      title: 'Steam 100 TL Cüzdan Kodu (TR)',
      description: 'Steam Türkiye hesaplarında bakiye olarak kullanılabilen resmi dijital cüzdan pini.',
      lowest_price: 96.50,
      highest_price: 110.00,
      original_price: 100.00,
      vendor_count: 7,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '1 TL = 0.965 TL',
      rating: 4.9,
      rating_count: 14890,
      tags: JSON.stringify(['İndirimli Bakiye', 'Popüler']),
      is_price_drop: 0,
      drop_percentage: 4,
      priceTrend: [
        { month: 'May', price: 99.0 },
        { month: 'Haz', price: 98.5 },
        { month: 'Tem', price: 98.0 },
        { month: 'Ağu', price: 97.0 },
        { month: 'Eyl', price: 97.0 },
        { month: 'Eki', price: 96.5 }
      ],
      vendors: [
        { id: 'v_kopazar_steam', vendor_name: 'Kopazar', price: 96.50, original_price: 100.00, rating: 9.7, total_reviews: 18400, delivery_speed: 'Anında E-Pin', payment_bonus: '%1 Ekstra Bonus', badges: ['En Ucuz', 'Otomatik Teslim'], payment_methods: ['Papara', 'Fast / EFT', 'Kredi Kartı'], url: 'https://www.kopazar.com' },
        { id: 'v_byno_steam', vendor_name: 'ByNoGame', price: 97.00, original_price: 100.00, rating: 9.9, total_reviews: 49000, delivery_speed: 'Anında Ekranda & SMS', badges: ['Yetkili Bayi', 'En Çok Tercih Edilen'], payment_methods: ['Kredi Kartı', 'Papara'], url: 'https://www.bynogame.com' }
      ]
    },
    {
      id: 'val_7400',
      game_id: 'val',
      game_name: 'Valorant',
      title: 'Valorant 7400 VP (Türkiye)',
      description: 'Büyük paket avantajı! En yüksek birim tasarrufu sağlayan resmi Riot Games VP kodu.',
      lowest_price: 1215.00,
      highest_price: 1420.00,
      original_price: 1350.00,
      vendor_count: 5,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '0.164 TL / 1 VP (En Avantajlı)',
      rating: 5.0,
      rating_count: 4150,
      tags: JSON.stringify(['En Yüksek Tasarruf', 'Fiyatı Düşen']),
      is_price_drop: 1,
      drop_percentage: 10,
      priceTrend: [
        { month: 'May', price: 1350.0 },
        { month: 'Haz', price: 1320.0 },
        { month: 'Tem', price: 1290.0 },
        { month: 'Ağu', price: 1260.0 },
        { month: 'Eyl', price: 1240.0 },
        { month: 'Eki', price: 1215.0 }
      ],
      vendors: [
        { id: 'v_byno_val_7400', vendor_name: 'ByNoGame', price: 1215.00, original_price: 1350.00, rating: 9.9, total_reviews: 42800, delivery_speed: 'Anında Teslimat', payment_bonus: '%3 Bonus Bakiye', badges: ['En Ucuz', 'Riot Partner'], payment_methods: ['Papara', 'Kredi Kartı', 'Havale'], url: 'https://www.bynogame.com' },
        { id: 'v_oyunfor_val_7400', vendor_name: 'Oyunfor', price: 1229.00, original_price: 1360.00, rating: 9.8, total_reviews: 31200, delivery_speed: 'Anında Kod', badges: ['Yetkili Satıcı'], payment_methods: ['Kredi Kartı', 'Papara'], url: 'https://www.oyunfor.com' }
      ]
    },
    {
      id: 'lol_1850',
      game_id: 'lol',
      game_name: 'League of Legends',
      title: 'LoL 1850 RP (Türkiye)',
      description: 'League of Legends TR sunucusu için Riot Points kodu. Kostüm ve bilet alımlarında geçerlidir.',
      lowest_price: 315.00,
      highest_price: 365.00,
      original_price: 350.00,
      vendor_count: 5,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '0.170 TL / 1 RP',
      rating: 4.8,
      rating_count: 5620,
      tags: JSON.stringify(['Popüler', 'Anında Kod']),
      is_price_drop: 1,
      drop_percentage: 10,
      priceTrend: [
        { month: 'May', price: 350.0 },
        { month: 'Haz', price: 345.0 },
        { month: 'Tem', price: 335.0 },
        { month: 'Ağu', price: 330.0 },
        { month: 'Eyl', price: 322.0 },
        { month: 'Eki', price: 315.0 }
      ],
      vendors: [
        { id: 'v_oyunfor_lol', vendor_name: 'Oyunfor', price: 315.00, original_price: 350.00, rating: 9.8, total_reviews: 31200, delivery_speed: 'Anında Kod', payment_bonus: '3 TL Puan', badges: ['En Ucuz', 'Yetkili Bayi'], payment_methods: ['Papara', 'Kredi Kartı'], url: 'https://www.oyunfor.com' },
        { id: 'v_byno_lol', vendor_name: 'ByNoGame', price: 318.50, original_price: 350.00, rating: 9.9, total_reviews: 42800, delivery_speed: 'Anında SMS', badges: ['Güvenilir'], payment_methods: ['Papara', 'Kredi Kartı'], url: 'https://www.bynogame.com' }
      ]
    },
    {
      id: 'roblox_800',
      game_id: 'roblox',
      game_name: 'Roblox',
      title: 'Roblox 800 Robux Dijital Kod',
      description: 'Roblox hesabına eklenebilen küresel geçerli 800 Robux hediye kodu.',
      lowest_price: 345.00,
      highest_price: 420.00,
      original_price: 399.00,
      vendor_count: 4,
      in_stock: 1,
      instant_delivery: 1,
      unit_price_text: '0.431 TL / 1 Robux',
      rating: 4.7,
      rating_count: 3800,
      tags: JSON.stringify(['Global Kod', 'Fırsat']),
      is_price_drop: 1,
      drop_percentage: 13,
      priceTrend: [
        { month: 'May', price: 399.0 },
        { month: 'Haz', price: 390.0 },
        { month: 'Tem', price: 380.0 },
        { month: 'Ağu', price: 365.0 },
        { month: 'Eyl', price: 355.0 },
        { month: 'Eki', price: 345.0 }
      ],
      vendors: [
        { id: 'v_kopazar_roblox', vendor_name: 'Kopazar', price: 345.00, original_price: 399.00, rating: 9.7, total_reviews: 16300, delivery_speed: 'Anında Teslimat', badges: ['En Ucuz', 'Global'], payment_methods: ['Papara', 'Kredi Kartı'], url: 'https://www.kopazar.com' },
        { id: 'v_byno_roblox', vendor_name: 'ByNoGame', price: 352.00, original_price: 405.00, rating: 9.9, total_reviews: 34200, delivery_speed: 'Anında Ekranda', badges: ['Güvenli Satıcı'], payment_methods: ['Kredi Kartı', 'Havale'], url: 'https://www.bynogame.com' }
      ]
    }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (
      id, game_id, game_name, title, description,
      lowest_price, highest_price, original_price, vendor_count,
      in_stock, instant_delivery, unit_price_text, rating,
      rating_count, tags, is_price_drop, drop_percentage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVendor = db.prepare(`
    INSERT INTO vendor_offers (
      id, product_id, vendor_name, price, original_price, rating,
      total_reviews, delivery_speed, payment_bonus, badges, payment_methods, url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO price_history (product_id, month_name, price, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  for (const p of initialProducts) {
    insertProd.run(
      p.id, p.game_id, p.game_name, p.title, p.description,
      p.lowest_price, p.highest_price, p.original_price, p.vendor_count,
      p.in_stock, p.instant_delivery, p.unit_price_text, p.rating,
      p.rating_count, p.tags, p.is_price_drop, p.drop_percentage
    );

    for (const v of p.vendors) {
      insertVendor.run(
        v.id, p.id, v.vendor_name, v.price, v.original_price, v.rating,
        v.total_reviews, v.delivery_speed, v.payment_bonus || null,
        JSON.stringify(v.badges || []), JSON.stringify(v.payment_methods || []), v.url
      );
    }

    p.priceTrend.forEach((pt, idx) => {
      insertHistory.run(p.id, pt.month, pt.price, idx);
    });
  }
}

// Seed coupons if empty
const coupCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get().count;
if (coupCount === 0) {
  const insertCoup = db.prepare('INSERT INTO coupons (id, store_name, code, discount_title, details, min_spend, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertCoup.run('c1', 'ByNoGame', 'EPAKCE25', '25 TL İndirim', 'Tüm Valorant ve LoL epin alımlarında geçerli indirim kodu.', '250 TL ve üzeri', '31 Ekim 2026');
  insertCoup.run('c2', 'Oyunfor', 'OYUNFORPUBG', '%5 Anında İndirim', 'PUBG Mobile UC ID yüklemelerinde geçerli özel kod.', 'Alt limitsiz', '15 Kasım 2026');
  insertCoup.run('c3', 'Kopazar', 'STEAMBONUS', '%3 Ekstra Bakiye', 'Steam Cüzdan Kodlarında geçerli anında nakit iade puanı.', '100 TL ve üzeri', 'Günün Fırsatı');
  insertCoup.run('c4', 'Klasgame', 'KLAS10', '10 TL Hoşgeldin İndirimi', 'İlk epin siparişinizde geçerli anında bakiye indirimi.', '150 TL ve üzeri', 'Süresiz');
}

// Seed default alerts if empty
const alertCount = db.prepare('SELECT COUNT(*) as count FROM price_alerts').get().count;
if (alertCount === 0) {
  const insertAlert = db.prepare('INSERT INTO price_alerts (id, product_id, product_title, game_name, current_price, target_price, is_active, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertAlert.run('alert_1', 'val_2850', 'Valorant 2850 VP (Türkiye)', 'Valorant', 484.90, 470.00, 1, 'Dün');
  insertAlert.run('alert_2', 'pubg_660', 'PUBG Mobile 660 UC', 'PUBG Mobile', 339.00, 320.00, 1, '3 Gün Önce');
}

// Seed sample orders for external partner route
const orderCount = db.prepare('SELECT COUNT(*) as count FROM external_orders').get().count;
if (orderCount === 0) {
  const insertOrder = db.prepare('INSERT INTO external_orders (id, partner_name, product_id, product_title, amount, status) VALUES (?, ?, ?, ?, ?, ?)');
  insertOrder.run('ord_byno_9011', 'ByNoGame', 'val_2850', 'Valorant 2850 VP', 484.90, 'completed');
  insertOrder.run('ord_oyun_4421', 'Oyunfor', 'pubg_660', 'PUBG Mobile 660 UC', 339.00, 'completed');
  insertOrder.run('ord_kopa_1892', 'Kopazar', 'steam_100', 'Steam 100 TL', 96.50, 'processing');
}

module.exports = db;

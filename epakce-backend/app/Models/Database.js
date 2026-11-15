// ============================================================================
// Epakçe Veritabanı Modeli & SQLite Şeması
// Tablolar: categories, products, vendor_offers, price_history, coupons, users, api_keys
// ============================================================================

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbFile = path.join(__dirname, 'epakce.sqlite');
const db = new DatabaseSync(dbFile);

// Tabloları oluşturuyoruz
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    item_count INTEGER DEFAULT 0
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
    unit_price_text TEXT,
    rating REAL DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0,
    tags TEXT,
    is_price_drop INTEGER DEFAULT 0,
    drop_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(game_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS vendor_offers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    rating REAL DEFAULT 9.5,
    review_count INTEGER DEFAULT 0,
    delivery_speed TEXT,
    payment_perk TEXT,
    url TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    month_name TEXT NOT NULL,
    price REAL NOT NULL,
    order_index INTEGER DEFAULT 0,
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
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    api_token TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    rate_limit INTEGER DEFAULT 300
  );

  CREATE TABLE IF NOT EXISTS external_orders (
    id TEXT PRIMARY KEY,
    partner_name TEXT NOT NULL,
    product_title TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'tamamlandı',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Veritabanını temizleyip yeniden zenginleştir
db.exec(`
  PRAGMA foreign_keys = OFF;
  DELETE FROM vendor_offers;
  DELETE FROM price_history;
  DELETE FROM products;
  DELETE FROM categories;
  PRAGMA foreign_keys = ON;
`);

const insertCat = db.prepare('INSERT INTO categories (id, name, icon, item_count) VALUES (?, ?, ?, ?)');
insertCat.run('all', 'Tümü', '🔥', 28);
insertCat.run('lol', 'League of Legends RP', '⚔️', 6);
insertCat.run('val', 'Valorant VP', '🎯', 7);
insertCat.run('pubg', 'PUBG Mobile UC', '🪖', 6);
insertCat.run('steam', 'Steam Cüzdan', '🎮', 4);
insertCat.run('roblox', 'Robux', '🧱', 3);
insertCat.run('fc25', 'EA FC 25 Points', '⚽', 3);
insertCat.run('knight', 'Knight Online', '🛡️', 3);

const prods = [
  // ==================== LEAGUE OF LEGENDS RP ====================
  {
    id: 'lol_575',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 575 RP (Türkiye)',
    description: 'League of Legends TR sunucusunda geçerli Riot Points kodu. Anında teslim edilir.',
    lowest_price: 104.90,
    highest_price: 120.00,
    original_price: 115.00,
    vendor_count: 5,
    unit_price_text: '0.182 TL / 1 RP',
    rating: 4.8,
    rating_count: 4320,
    tags: JSON.stringify(['Başlangıç Paketi', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 9,
    vendors: [
      { id: 'v_lol_575_1', name: 'Oyunfor', price: 104.90, orig: 115.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: '1 TL Cüzdan Puanı', url: 'https://www.oyunfor.com' },
      { id: 'v_lol_575_2', name: 'ByNoGame', price: 107.00, orig: 115.0, rating: 9.9, rev: 42800, del: 'Anında SMS & Mail', perk: '%2 Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_lol_575_3', name: 'Kopazar', price: 108.50, orig: 118.0, rating: 9.7, rev: 19400, del: '1-2 Dakika', perk: 'Güvenli Ödeme', url: 'https://www.kopazar.com' },
      { id: 'v_lol_575_4', name: 'Klasgame', price: 109.00, orig: 120.0, rating: 9.6, rev: 15800, del: 'Anında Teslimat', perk: 'Hızlı Teslim', url: 'https://www.klasgame.com' }
    ],
    history: [
      { m: 'May', p: 115.0 }, { m: 'Haz', p: 112.0 }, { m: 'Tem', p: 110.0 },
      { m: 'Ağu', p: 108.0 }, { m: 'Eyl', p: 106.0 }, { m: 'Eki', p: 104.9 }
    ]
  },
  {
    id: 'lol_1380',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 1380 RP (Türkiye)',
    description: 'Riot Games TR sunucuları için resmi RP dijital e-pini.',
    lowest_price: 239.00,
    highest_price: 275.00,
    original_price: 260.00,
    vendor_count: 5,
    unit_price_text: '0.173 TL / 1 RP',
    rating: 4.9,
    rating_count: 5890,
    tags: JSON.stringify(['Popüler', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 8,
    vendors: [
      { id: 'v_lol_1380_1', name: 'ByNoGame', price: 239.00, orig: 260.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%2 Bonus Bakiye', url: 'https://www.bynogame.com' },
      { id: 'v_lol_1380_2', name: 'Oyunfor', price: 242.00, orig: 265.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Bayi', url: 'https://www.oyunfor.com' },
      { id: 'v_lol_1380_3', name: 'Kopazar', price: 245.00, orig: 270.0, rating: 9.7, rev: 19400, del: 'Anında Ekranda', perk: 'Güvenli', url: 'https://www.kopazar.com' }
    ],
    history: [
      { m: 'May', p: 260.0 }, { m: 'Haz', p: 255.0 }, { m: 'Tem', p: 250.0 },
      { m: 'Ağu', p: 246.0 }, { m: 'Eyl', p: 242.0 }, { m: 'Eki', p: 239.0 }
    ]
  },
  {
    id: 'lol_1850',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 1850 RP (Türkiye)',
    description: 'League of Legends TR sunucusu için Riot Points kodu. Kostüm ve bilet alımlarında en çok tercih edilen paket.',
    lowest_price: 315.00,
    highest_price: 365.00,
    original_price: 350.00,
    vendor_count: 6,
    unit_price_text: '0.170 TL / 1 RP',
    rating: 4.9,
    rating_count: 8940,
    tags: JSON.stringify(['En Çok Satan', 'Fiyatı Düşen', 'Günün Fırsatı']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_lol_1850_1', name: 'Oyunfor', price: 315.00, orig: 350.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: '3 TL Cüzdan Puan', url: 'https://www.oyunfor.com' },
      { id: 'v_lol_1850_2', name: 'ByNoGame', price: 318.50, orig: 350.0, rating: 9.9, rev: 42800, del: 'Anında SMS', perk: '%2 Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_lol_1850_3', name: 'Kopazar', price: 322.00, orig: 355.0, rating: 9.7, rev: 19400, del: 'Anında Teslim', perk: 'Güvenli', url: 'https://www.kopazar.com' },
      { id: 'v_lol_1850_4', name: 'Klasgame', price: 325.00, orig: 360.0, rating: 9.6, rev: 15800, del: '1-2 Dk', perk: 'Hızlı', url: 'https://www.klasgame.com' },
      { id: 'v_lol_1850_5', name: 'Trendyol', price: 339.00, orig: 365.0, rating: 9.5, rev: 9800, del: 'E-posta ile Kod', perk: 'Trendyol Güvencesi', url: 'https://www.trendyol.com' }
    ],
    history: [
      { m: 'May', p: 350.0 }, { m: 'Haz', p: 345.0 }, { m: 'Tem', p: 335.0 },
      { m: 'Ağu', p: 330.0 }, { m: 'Eyl', p: 322.0 }, { m: 'Eki', p: 315.0 }
    ]
  },
  {
    id: 'lol_2800',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 2800 RP (Türkiye)',
    description: 'Popüler efsanevi kostüm ve etkinlik kartları için avantajlı paket.',
    lowest_price: 459.00,
    highest_price: 520.00,
    original_price: 500.00,
    vendor_count: 5,
    unit_price_text: '0.163 TL / 1 RP',
    rating: 4.8,
    rating_count: 6120,
    tags: JSON.stringify(['Avantajlı Paket', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 8,
    vendors: [
      { id: 'v_lol_2800_1', name: 'Kopazar', price: 459.00, orig: 500.0, rating: 9.7, rev: 19400, del: 'Anında Kod', perk: '%1 Bonus Bakiye', url: 'https://www.kopazar.com' },
      { id: 'v_lol_2800_2', name: 'ByNoGame', price: 462.00, orig: 505.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%2 Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_lol_2800_3', name: 'Oyunfor', price: 465.00, orig: 510.0, rating: 9.8, rev: 31200, del: 'Anında SMS', perk: '5 TL Puan', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 500.0 }, { m: 'Haz', p: 490.0 }, { m: 'Tem', p: 480.0 },
      { m: 'Ağu', p: 472.0 }, { m: 'Eyl', p: 465.0 }, { m: 'Eki', p: 459.0 }
    ]
  },
  {
    id: 'lol_6500',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 6500 RP (Türkiye)',
    description: 'Büyük RP paketi! Yüksek birim tasarrufu sağlayan resmi Riot RP kodu.',
    lowest_price: 989.00,
    highest_price: 1140.00,
    original_price: 1080.00,
    vendor_count: 5,
    unit_price_text: '0.152 TL / 1 RP (Yüksek Tasarruf)',
    rating: 5.0,
    rating_count: 3410,
    tags: JSON.stringify(['Yüksek Tasarruf', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 9,
    vendors: [
      { id: 'v_lol_6500_1', name: 'ByNoGame', price: 989.00, orig: 1080.0, rating: 9.9, rev: 42800, del: 'Anında Ekranda', perk: '30 TL Bonus Bakiye', url: 'https://www.bynogame.com' },
      { id: 'v_lol_6500_2', name: 'Oyunfor', price: 995.00, orig: 1090.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 1080.0 }, { m: 'Haz', p: 1060.0 }, { m: 'Tem', p: 1030.0 },
      { m: 'Ağu', p: 1010.0 }, { m: 'Eyl', p: 999.0 }, { m: 'Eki', p: 989.0 }
    ]
  },
  {
    id: 'lol_10500',
    game_id: 'lol',
    game_name: 'League of Legends',
    title: 'LoL 10500 RP (Türkiye - Mega Paket)',
    description: 'En büyük resmi League of Legends paketi. RP başına en düşük maliyet garantisi.',
    lowest_price: 1540.00,
    highest_price: 1780.00,
    original_price: 1700.00,
    vendor_count: 4,
    unit_price_text: '0.146 TL / 1 RP (En Karlı RP)',
    rating: 5.0,
    rating_count: 2190,
    tags: JSON.stringify(['En Karlı RP', 'Mega Paket']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_lol_10500_1', name: 'Oyunfor', price: 1540.00, orig: 1700.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_lol_10500_2', name: 'ByNoGame', price: 1555.00, orig: 1720.0, rating: 9.9, rev: 42800, del: 'Anında Teslim', perk: '%3 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 1700.0 }, { m: 'Haz', p: 1670.0 }, { m: 'Tem', p: 1620.0 },
      { m: 'Ağu', p: 1590.0 }, { m: 'Eyl', p: 1560.0 }, { m: 'Eki', p: 1540.0 }
    ]
  },

  // ==================== VALORANT VP ====================
  {
    id: 'val_475',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 475 VP (Türkiye)',
    description: 'Riot Games Valorant TR resmi e-pin kodu.',
    lowest_price: 94.50,
    highest_price: 110.00,
    original_price: 105.00,
    vendor_count: 5,
    unit_price_text: '0.198 TL / 1 VP',
    rating: 4.8,
    rating_count: 3200,
    tags: JSON.stringify(['Giriş Paketi', 'Hızlı Teslim']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_val_475_1', name: 'Oyunfor', price: 94.50, orig: 105.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Bayi', url: 'https://www.oyunfor.com' },
      { id: 'v_val_475_2', name: 'ByNoGame', price: 96.00, orig: 105.0, rating: 9.9, rev: 42800, del: 'Anında SMS', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 105.0 }, { m: 'Haz', p: 102.0 }, { m: 'Tem', p: 99.0 },
      { m: 'Ağu', p: 97.0 }, { m: 'Eyl', p: 95.5 }, { m: 'Eki', p: 94.5 }
    ]
  },
  {
    id: 'val_1000',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 1000 VP (Türkiye)',
    description: 'Savaş Bileti alımları için en popüler Valorant Points kodu.',
    lowest_price: 189.00,
    highest_price: 215.00,
    original_price: 205.00,
    vendor_count: 6,
    unit_price_text: '0.189 TL / 1 VP',
    rating: 4.9,
    rating_count: 9800,
    tags: JSON.stringify(['En Çok Satan', 'Savaş Bileti']),
    is_price_drop: 1,
    drop_percentage: 8,
    vendors: [
      { id: 'v_val_1000_1', name: 'ByNoGame', price: 189.00, orig: 205.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%2 Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_val_1000_2', name: 'Oyunfor', price: 191.00, orig: 205.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_val_1000_3', name: 'Kopazar', price: 193.00, orig: 210.0, rating: 9.7, rev: 19400, del: '1-2 Dk', perk: 'Güvenli', url: 'https://www.kopazar.com' }
    ],
    history: [
      { m: 'May', p: 205.0 }, { m: 'Haz', p: 202.0 }, { m: 'Tem', p: 198.0 },
      { m: 'Ağu', p: 195.0 }, { m: 'Eyl', p: 191.0 }, { m: 'Eki', p: 189.0 }
    ]
  },
  {
    id: 'val_2050',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 2050 VP (Türkiye)',
    description: 'Silah kaplamaları ve gece pazarı için ideal VP paketi.',
    lowest_price: 369.00,
    highest_price: 420.00,
    original_price: 400.00,
    vendor_count: 5,
    unit_price_text: '0.180 TL / 1 VP',
    rating: 4.8,
    rating_count: 6700,
    tags: JSON.stringify(['Popüler', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 8,
    vendors: [
      { id: 'v_val_2050_1', name: 'Oyunfor', price: 369.00, orig: 400.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_val_2050_2', name: 'ByNoGame', price: 372.00, orig: 405.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 400.0 }, { m: 'Haz', p: 395.0 }, { m: 'Tem', p: 388.0 },
      { m: 'Ağu', p: 380.0 }, { m: 'Eyl', p: 374.0 }, { m: 'Eki', p: 369.0 }
    ]
  },
  {
    id: 'val_2850',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 2850 VP (Türkiye)',
    description: 'Riot Games TR sunucularında geçerli Valorant Points dijital kodu. Anında teslim edilir.',
    lowest_price: 484.90,
    highest_price: 569.00,
    original_price: 540.00,
    vendor_count: 6,
    unit_price_text: '0.170 TL / 1 VP',
    rating: 4.9,
    rating_count: 8420,
    tags: JSON.stringify(['En Çok Satan', 'Fiyatı Düşen', 'Popüler']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_val_2850_1', name: 'ByNoGame', price: 484.90, orig: 530.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat (SMS/Mail)', perk: '%2 Bonus Bakiye', url: 'https://www.bynogame.com' },
      { id: 'v_val_2850_2', name: 'Oyunfor', price: 489.00, orig: 540.0, rating: 9.8, rev: 31200, del: 'Anında Kod Teslimi', perk: '5 TL Cüzdan Puan', url: 'https://www.oyunfor.com' },
      { id: 'v_val_2850_3', name: 'Kopazar', price: 492.50, orig: 545.0, rating: 9.7, rev: 19400, del: '1-2 Dakika', perk: 'Güvenli Ödeme', url: 'https://www.kopazar.com' },
      { id: 'v_val_2850_4', name: 'Klasgame', price: 495.00, orig: 550.0, rating: 9.6, rev: 15800, del: 'Anında Teslimat', perk: 'Hızlı Teslim', url: 'https://www.klasgame.com' },
      { id: 'v_val_2850_5', name: 'Trendyol', price: 519.90, orig: 560.0, rating: 9.5, rev: 9800, del: 'E-posta ile Kod', perk: 'Trendyol Güvencesi', url: 'https://www.trendyol.com' }
    ],
    history: [
      { m: 'May', p: 540.0 }, { m: 'Haz', p: 535.0 }, { m: 'Tem', p: 520.0 },
      { m: 'Ağu', p: 510.0 }, { m: 'Eyl', p: 499.0 }, { m: 'Eki', p: 484.9 }
    ]
  },
  {
    id: 'val_5350',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 5350 VP (Türkiye)',
    description: 'Yüksek VP tasarruflu resmi Riot Games Valorant Points e-pini.',
    lowest_price: 885.00,
    highest_price: 990.00,
    original_price: 960.00,
    vendor_count: 5,
    unit_price_text: '0.165 TL / 1 VP',
    rating: 4.9,
    rating_count: 5400,
    tags: JSON.stringify(['Avantajlı', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 8,
    vendors: [
      { id: 'v_val_5350_1', name: 'Oyunfor', price: 885.00, orig: 960.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_val_5350_2', name: 'ByNoGame', price: 890.00, orig: 965.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 960.0 }, { m: 'Haz', p: 945.0 }, { m: 'Tem', p: 925.0 },
      { m: 'Ağu', p: 905.0 }, { m: 'Eyl', p: 895.0 }, { m: 'Eki', p: 885.0 }
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
    unit_price_text: '0.164 TL / 1 VP (En Karlı)',
    rating: 5.0,
    rating_count: 4150,
    tags: JSON.stringify(['En Yüksek Tasarruf', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_val_7400_1', name: 'ByNoGame', price: 1215.00, orig: 1350.0, rating: 9.9, rev: 42800, del: 'Anında Teslimat', perk: '%3 Bonus (36 TL)', url: 'https://www.bynogame.com' },
      { id: 'v_val_7400_2', name: 'Oyunfor', price: 1229.00, orig: 1360.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Bayi', url: 'https://www.oyunfor.com' },
      { id: 'v_val_7400_3', name: 'Kopazar', price: 1240.00, orig: 1380.0, rating: 9.7, rev: 19400, del: 'Anında Teslim', perk: 'Güvenli', url: 'https://www.kopazar.com' }
    ],
    history: [
      { m: 'May', p: 1350.0 }, { m: 'Haz', p: 1320.0 }, { m: 'Tem', p: 1290.0 },
      { m: 'Ağu', p: 1260.0 }, { m: 'Eyl', p: 1240.0 }, { m: 'Eki', p: 1215.0 }
    ]
  },
  {
    id: 'val_11000',
    game_id: 'val',
    game_name: 'Valorant',
    title: 'Valorant 11000 VP (Şampiyon Paketi)',
    description: 'Koleksiyoncular için en büyük resmi Riot Valorant Points paketi.',
    lowest_price: 1749.00,
    highest_price: 1980.00,
    original_price: 1920.00,
    vendor_count: 4,
    unit_price_text: '0.159 TL / 1 VP (En Düşük Birim Fiyat)',
    rating: 5.0,
    rating_count: 2190,
    tags: JSON.stringify(['Mega Tasarruf', 'Şampiyon']),
    is_price_drop: 1,
    drop_percentage: 9,
    vendors: [
      { id: 'v_val_11000_1', name: 'ByNoGame', price: 1749.00, orig: 1920.0, rating: 9.9, rev: 42800, del: 'Anında Teslim', perk: '52 TL Bonus Bakiye', url: 'https://www.bynogame.com' },
      { id: 'v_val_11000_2', name: 'Oyunfor', price: 1765.00, orig: 1940.0, rating: 9.8, rev: 31200, del: 'Anında Kod', perk: 'Yetkili Bayi', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 1920.0 }, { m: 'Haz', p: 1880.0 }, { m: 'Tem', p: 1840.0 },
      { m: 'Ağu', p: 1800.0 }, { m: 'Eyl', p: 1770.0 }, { m: 'Eki', p: 1749.0 }
    ]
  },

  // ==================== PUBG MOBILE UC ====================
  {
    id: 'pubg_60',
    game_id: 'pubg',
    game_name: 'PUBG Mobile',
    title: 'PUBG Mobile 60 UC',
    description: 'PUBG Mobile oyuncu ID ile anında yüklenen resmi UC paketi.',
    lowest_price: 36.50,
    highest_price: 45.00,
    original_price: 42.00,
    vendor_count: 5,
    unit_price_text: '0.608 TL / 1 UC',
    rating: 4.7,
    rating_count: 4500,
    tags: JSON.stringify(['Giriş', 'ID Yükleme']),
    is_price_drop: 1,
    drop_percentage: 13,
    vendors: [
      { id: 'v_pubg_60_1', name: 'Oyunfor', price: 36.50, orig: 42.0, rating: 9.8, rev: 28900, del: '1 Dakikada ID', perk: 'Anında', url: 'https://www.oyunfor.com' },
      { id: 'v_pubg_60_2', name: 'ByNoGame', price: 37.50, orig: 42.0, rating: 9.9, rev: 39000, del: 'Anında', perk: 'Hızlı', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 42.0 }, { m: 'Haz', p: 40.0 }, { m: 'Tem', p: 39.0 },
      { m: 'Ağu', p: 38.0 }, { m: 'Eyl', p: 37.0 }, { m: 'Eki', p: 36.5 }
    ]
  },
  {
    id: 'pubg_325',
    game_id: 'pubg',
    game_name: 'PUBG Mobile',
    title: 'PUBG Mobile 325 UC',
    description: 'PUBG Royale Pass başlangıç paketi.',
    lowest_price: 172.00,
    highest_price: 210.00,
    original_price: 195.00,
    vendor_count: 5,
    unit_price_text: '0.529 TL / 1 UC',
    rating: 4.8,
    rating_count: 6700,
    tags: JSON.stringify(['Popüler', 'Royale Pass']),
    is_price_drop: 1,
    drop_percentage: 12,
    vendors: [
      { id: 'v_pubg_325_1', name: 'Oyunfor', price: 172.00, orig: 195.0, rating: 9.8, rev: 28900, del: 'Anında ID Yükleme', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_pubg_325_2', name: 'ByNoGame', price: 174.50, orig: 198.0, rating: 9.9, rev: 39000, del: 'Anında', perk: '%1 İade', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 195.0 }, { m: 'Haz', p: 190.0 }, { m: 'Tem', p: 185.0 },
      { m: 'Ağu', p: 180.0 }, { m: 'Eyl', p: 175.0 }, { m: 'Eki', p: 172.0 }
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
    unit_price_text: '0.513 TL / 1 UC',
    rating: 4.8,
    rating_count: 11200,
    tags: JSON.stringify(['En Çok Satan', 'ID Yükleme', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 11,
    vendors: [
      { id: 'v_pubg_660_1', name: 'Oyunfor', price: 339.00, orig: 380.0, rating: 9.8, rev: 28900, del: 'Otomatik ID Yükleme (1 Dk)', perk: '%1 Cüzdan İade', url: 'https://www.oyunfor.com' },
      { id: 'v_pubg_660_2', name: 'ByNoGame', price: 342.00, orig: 385.0, rating: 9.9, rev: 39000, del: 'Anında Oyuncu ID Yüklemesi', perk: '3 TL Hediye', url: 'https://www.bynogame.com' },
      { id: 'v_pubg_660_3', name: 'Klasgame', price: 348.50, orig: 390.0, rating: 9.6, rev: 11400, del: '1-3 Dakika', perk: 'Güvenli', url: 'https://www.klasgame.com' },
      { id: 'v_pubg_660_4', name: 'Kopazar', price: 352.00, orig: 395.0, rating: 9.7, rev: 14200, del: 'Anında ID', perk: 'Hızlı', url: 'https://www.kopazar.com' }
    ],
    history: [
      { m: 'May', p: 390.0 }, { m: 'Haz', p: 380.0 }, { m: 'Tem', p: 370.0 },
      { m: 'Ağu', p: 355.0 }, { m: 'Eyl', p: 345.0 }, { m: 'Eki', p: 339.0 }
    ]
  },
  {
    id: 'pubg_1800',
    game_id: 'pubg',
    game_name: 'PUBG Mobile',
    title: 'PUBG Mobile 1800 UC',
    description: 'Silah yükseltmeleri ve sandık açılışları için avantajlı UC paketi.',
    lowest_price: 889.00,
    highest_price: 1040.00,
    original_price: 990.00,
    vendor_count: 5,
    unit_price_text: '0.493 TL / 1 UC',
    rating: 4.9,
    rating_count: 5100,
    tags: JSON.stringify(['Avantajlı Paket', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_pubg_1800_1', name: 'Oyunfor', price: 889.00, orig: 990.0, rating: 9.8, rev: 28900, del: 'Anında ID', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' },
      { id: 'v_pubg_1800_2', name: 'ByNoGame', price: 899.00, orig: 995.0, rating: 9.9, rev: 39000, del: 'Anında', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 990.0 }, { m: 'Haz', p: 970.0 }, { m: 'Tem', p: 940.0 },
      { m: 'Ağu', p: 915.0 }, { m: 'Eyl', p: 900.0 }, { m: 'Eki', p: 889.0 }
    ]
  },
  {
    id: 'pubg_3850',
    game_id: 'pubg',
    game_name: 'PUBG Mobile',
    title: 'PUBG Mobile 3850 UC',
    description: 'Büyük UC paketi ile Royale Pass Elite ve sandık avantajı.',
    lowest_price: 1820.00,
    highest_price: 2150.00,
    original_price: 2050.00,
    vendor_count: 4,
    unit_price_text: '0.472 TL / 1 UC (Tasarruflu)',
    rating: 4.9,
    rating_count: 3200,
    tags: JSON.stringify(['Büyük Paket', 'Tasarruflu']),
    is_price_drop: 1,
    drop_percentage: 11,
    vendors: [
      { id: 'v_pubg_3850_1', name: 'ByNoGame', price: 1820.00, orig: 2050.0, rating: 9.9, rev: 39000, del: 'Anında ID Yükleme', perk: '54 TL Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_pubg_3850_2', name: 'Oyunfor', price: 1835.00, orig: 2060.0, rating: 9.8, rev: 28900, del: '1 Dakika', perk: 'Yetkili Satıcı', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 2050.0 }, { m: 'Haz', p: 2000.0 }, { m: 'Tem', p: 1950.0 },
      { m: 'Ağu', p: 1900.0 }, { m: 'Eyl', p: 1850.0 }, { m: 'Eki', p: 1820.0 }
    ]
  },
  {
    id: 'pubg_8100',
    game_id: 'pubg',
    game_name: 'PUBG Mobile',
    title: 'PUBG Mobile 8100 UC (Mega Paket)',
    description: 'En yüksek birim tasarrufu sunan mega PUBG Mobile Unknown Cash paketi.',
    lowest_price: 3590.00,
    highest_price: 4200.00,
    original_price: 3990.00,
    vendor_count: 4,
    unit_price_text: '0.443 TL / 1 UC (En Karlı UC)',
    rating: 5.0,
    rating_count: 1840,
    tags: JSON.stringify(['Mega Paket', 'En Karlı UC']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_pubg_8100_1', name: 'Oyunfor', price: 3590.00, orig: 3990.0, rating: 9.8, rev: 28900, del: 'Anında Otomatik ID', perk: 'Yetkili Distribütör', url: 'https://www.oyunfor.com' },
      { id: 'v_pubg_8100_2', name: 'ByNoGame', price: 3620.00, orig: 4020.0, rating: 9.9, rev: 39000, del: 'Anında ID', perk: '108 TL Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 3990.0 }, { m: 'Haz', p: 3900.0 }, { m: 'Tem', p: 3800.0 },
      { m: 'Ağu', p: 3720.0 }, { m: 'Eyl', p: 3650.0 }, { m: 'Eki', p: 3590.0 }
    ]
  },

  // ==================== STEAM CÜZDAN ====================
  {
    id: 'steam_50',
    game_id: 'steam',
    game_name: 'Steam',
    title: 'Steam 50 TL Cüzdan Kodu (TR)',
    description: 'Steam Türkiye hesaplarında bakiye olarak geçerli resmi dijital kod.',
    lowest_price: 48.50,
    highest_price: 55.00,
    original_price: 50.00,
    vendor_count: 6,
    unit_price_text: '1 TL = 0.970 TL',
    rating: 4.8,
    rating_count: 8200,
    tags: JSON.stringify(['İndirimli Bakiye']),
    is_price_drop: 0,
    drop_percentage: 3,
    vendors: [
      { id: 'v_steam_50_1', name: 'Kopazar', price: 48.50, orig: 50.0, rating: 9.7, rev: 18400, del: 'Anında E-Pin', perk: '%1 Bonus', url: 'https://www.kopazar.com' },
      { id: 'v_steam_50_2', name: 'ByNoGame', price: 48.90, orig: 50.0, rating: 9.9, rev: 49000, del: 'Anında SMS', perk: 'Yetkili Bayi', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 50.0 }, { m: 'Haz', p: 49.5 }, { m: 'Tem', p: 49.0 },
      { m: 'Ağu', p: 49.0 }, { m: 'Eyl', p: 48.8 }, { m: 'Eki', p: 48.5 }
    ]
  },
  {
    id: 'steam_100',
    game_id: 'steam',
    game_name: 'Steam',
    title: 'Steam 100 TL Cüzdan Kodu (TR)',
    description: 'Steam Türkiye hesaplarında bakiye olarak geçerli dijital cüzdan pini.',
    lowest_price: 96.50,
    highest_price: 110.00,
    original_price: 100.00,
    vendor_count: 7,
    unit_price_text: '1 TL = 0.965 TL',
    rating: 4.9,
    rating_count: 14890,
    tags: JSON.stringify(['İndirimli Bakiye', 'Popüler']),
    is_price_drop: 0,
    drop_percentage: 4,
    vendors: [
      { id: 'v_steam_100_1', name: 'Kopazar', price: 96.50, orig: 100.0, rating: 9.7, rev: 18400, del: 'Anında E-Pin', perk: '%1 Ekstra Bonus', url: 'https://www.kopazar.com' },
      { id: 'v_steam_100_2', name: 'ByNoGame', price: 97.00, orig: 100.0, rating: 9.9, rev: 49000, del: 'Anında Ekranda & SMS', perk: 'Yetkili Bayi', url: 'https://www.bynogame.com' },
      { id: 'v_steam_100_3', name: 'Oyunfor', price: 97.50, orig: 100.0, rating: 9.8, rev: 34500, del: 'Anında Kod', perk: 'Güvenli', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 99.0 }, { m: 'Haz', p: 98.5 }, { m: 'Tem', p: 98.0 },
      { m: 'Ağu', p: 97.0 }, { m: 'Eyl', p: 97.0 }, { m: 'Eki', p: 96.5 }
    ]
  },
  {
    id: 'steam_250',
    game_id: 'steam',
    game_name: 'Steam',
    title: 'Steam 250 TL Cüzdan Kodu (TR)',
    description: 'Yeni çıkan popüler Steam oyunları için ideal indirimli bakiye.',
    lowest_price: 241.00,
    highest_price: 265.00,
    original_price: 250.00,
    vendor_count: 5,
    unit_price_text: '1 TL = 0.964 TL',
    rating: 4.9,
    rating_count: 7100,
    tags: JSON.stringify(['İndirimli Bakiye']),
    is_price_drop: 0,
    drop_percentage: 4,
    vendors: [
      { id: 'v_steam_250_1', name: 'ByNoGame', price: 241.00, orig: 250.0, rating: 9.9, rev: 49000, del: 'Anında Teslimat', perk: 'Yetkili Bayi', url: 'https://www.bynogame.com' },
      { id: 'v_steam_250_2', name: 'Kopazar', price: 242.50, orig: 250.0, rating: 9.7, rev: 18400, del: 'Anında Kod', perk: '%1 Bonus', url: 'https://www.kopazar.com' }
    ],
    history: [
      { m: 'May', p: 248.0 }, { m: 'Haz', p: 246.0 }, { m: 'Tem', p: 244.0 },
      { m: 'Ağu', p: 243.0 }, { m: 'Eyl', p: 242.0 }, { m: 'Eki', p: 241.0 }
    ]
  },
  {
    id: 'steam_500',
    game_id: 'steam',
    game_name: 'Steam',
    title: 'Steam 500 TL Cüzdan Kodu (TR)',
    description: 'Steam indirim dönemlerinde en çok tercih edilen bakiye paketi.',
    lowest_price: 482.00,
    highest_price: 520.00,
    original_price: 500.00,
    vendor_count: 5,
    unit_price_text: '1 TL = 0.964 TL',
    rating: 4.9,
    rating_count: 5600,
    tags: JSON.stringify(['Popüler Bakiye']),
    is_price_drop: 0,
    drop_percentage: 4,
    vendors: [
      { id: 'v_steam_500_1', name: 'Kopazar', price: 482.00, orig: 500.0, rating: 9.7, rev: 18400, del: 'Anında Kod', perk: 'Yetkili Bayi', url: 'https://www.kopazar.com' },
      { id: 'v_steam_500_2', name: 'ByNoGame', price: 484.00, orig: 500.0, rating: 9.9, rev: 49000, del: 'Anında', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 495.0 }, { m: 'Haz', p: 490.0 }, { m: 'Tem', p: 488.0 },
      { m: 'Ağu', p: 485.0 }, { m: 'Eyl', p: 483.0 }, { m: 'Eki', p: 482.0 }
    ]
  },

  // ==================== ROBLOX ROBUX ====================
  {
    id: 'roblox_400',
    game_id: 'roblox',
    game_name: 'Roblox',
    title: 'Roblox 400 Robux Dijital Kod',
    description: 'Roblox hesabına eklenebilen küresel geçerli 400 Robux hediye kodu.',
    lowest_price: 184.00,
    highest_price: 215.00,
    original_price: 205.00,
    vendor_count: 4,
    unit_price_text: '0.460 TL / 1 Robux',
    rating: 4.7,
    rating_count: 2400,
    tags: JSON.stringify(['Global Kod']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_roblox_400_1', name: 'Kopazar', price: 184.00, orig: 205.0, rating: 9.7, rev: 16300, del: 'Anında Kod', perk: 'Global', url: 'https://www.kopazar.com' },
      { id: 'v_roblox_400_2', name: 'ByNoGame', price: 188.00, orig: 210.0, rating: 9.9, rev: 34200, del: 'Anında Ekranda', perk: 'Güvenli', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 205.0 }, { m: 'Haz', p: 200.0 }, { m: 'Tem', p: 195.0 },
      { m: 'Ağu', p: 190.0 }, { m: 'Eyl', p: 186.0 }, { m: 'Eki', p: 184.0 }
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
    unit_price_text: '0.431 TL / 1 Robux',
    rating: 4.8,
    rating_count: 3800,
    tags: JSON.stringify(['Global Kod', 'Fırsat', 'Fiyatı Düşen']),
    is_price_drop: 1,
    drop_percentage: 13,
    vendors: [
      { id: 'v_roblox_800_1', name: 'Kopazar', price: 345.00, orig: 399.0, rating: 9.7, rev: 16300, del: 'Anında Teslimat', perk: 'Global Kod', url: 'https://www.kopazar.com' },
      { id: 'v_roblox_800_2', name: 'ByNoGame', price: 352.00, orig: 405.0, rating: 9.9, rev: 34200, del: 'Anında Ekranda', perk: 'Yetkili Satıcı', url: 'https://www.bynogame.com' },
      { id: 'v_roblox_800_3', name: 'Oyunfor', price: 359.00, orig: 410.0, rating: 9.8, rev: 27800, del: 'Anında Kod', perk: 'Onaylı', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 399.0 }, { m: 'Haz', p: 390.0 }, { m: 'Tem', p: 380.0 },
      { m: 'Ağu', p: 365.0 }, { m: 'Eyl', p: 355.0 }, { m: 'Eki', p: 345.0 }
    ]
  },
  {
    id: 'roblox_1700',
    game_id: 'roblox',
    game_name: 'Roblox',
    title: 'Roblox 1700 Robux Dijital Kod',
    description: 'Avatar kıyafetleri ve VIP oyun kartları için popüler Robux paketi.',
    lowest_price: 699.00,
    highest_price: 810.00,
    original_price: 780.00,
    vendor_count: 4,
    unit_price_text: '0.411 TL / 1 Robux',
    rating: 4.9,
    rating_count: 2900,
    tags: JSON.stringify(['Tasarruflu']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_roblox_1700_1', name: 'ByNoGame', price: 699.00, orig: 780.0, rating: 9.9, rev: 34200, del: 'Anında', perk: '%2 Bonus', url: 'https://www.bynogame.com' },
      { id: 'v_roblox_1700_2', name: 'Oyunfor', price: 710.00, orig: 790.0, rating: 9.8, rev: 27800, del: 'Anında Kod', perk: 'Yetkili', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 780.0 }, { m: 'Haz', p: 760.0 }, { m: 'Tem', p: 740.0 },
      { m: 'Ağu', p: 720.0 }, { m: 'Eyl', p: 705.0 }, { m: 'Eki', p: 699.0 }
    ]
  },

  // ==================== EA FC 25 ====================
  {
    id: 'fc25_500',
    game_id: 'fc25',
    game_name: 'EA FC 25',
    title: 'EA Sports FC 25 500 Points (PC/EA App)',
    description: 'Ultimate Team paketleri için resmi EA FC Points kodu.',
    lowest_price: 185.00,
    highest_price: 220.00,
    original_price: 210.00,
    vendor_count: 4,
    unit_price_text: '0.370 TL / 1 Point',
    rating: 4.7,
    rating_count: 1800,
    tags: JSON.stringify(['Yeni Sezon']),
    is_price_drop: 1,
    drop_percentage: 11,
    vendors: [
      { id: 'v_fc_500_1', name: 'Klasgame', price: 185.00, orig: 210.0, rating: 9.6, rev: 11200, del: 'Anında', perk: 'EA Partner', url: 'https://www.klasgame.com' },
      { id: 'v_fc_500_2', name: 'Oyunfor', price: 189.00, orig: 215.0, rating: 9.8, rev: 29400, del: 'Anında Kod', perk: 'Yetkili', url: 'https://www.oyunfor.com' }
    ],
    history: [
      { m: 'May', p: 210.0 }, { m: 'Haz', p: 205.0 }, { m: 'Tem', p: 198.0 },
      { m: 'Ağu', p: 192.0 }, { m: 'Eyl', p: 188.0 }, { m: 'Eki', p: 185.0 }
    ]
  },
  {
    id: 'fc25_1050',
    game_id: 'fc25',
    game_name: 'EA FC 25',
    title: 'EA Sports FC 25 1050 Points (PC/EA App)',
    description: 'Ultimate Team paketleri ve draft girişleri için geçerli resmi EA Sports FC Points kodu.',
    lowest_price: 369.00,
    highest_price: 440.00,
    original_price: 410.00,
    vendor_count: 4,
    unit_price_text: '0.351 TL / 1 Point',
    rating: 4.9,
    rating_count: 2950,
    tags: JSON.stringify(['Yeni Sezon', 'Popüler']),
    is_price_drop: 1,
    drop_percentage: 10,
    vendors: [
      { id: 'v_fc_1050_1', name: 'Klasgame', price: 369.00, orig: 410.0, rating: 9.6, rev: 11200, del: 'Anında Teslimat', perk: 'En Ucuz EA Partner', url: 'https://www.klasgame.com' },
      { id: 'v_fc_1050_2', name: 'Oyunfor', price: 375.00, orig: 420.0, rating: 9.8, rev: 29400, del: 'Anında Kod', perk: 'Resmi Bayi', url: 'https://www.oyunfor.com' },
      { id: 'v_fc_1050_3', name: 'ByNoGame', price: 380.00, orig: 430.0, rating: 9.9, rev: 38500, del: 'Anında SMS', perk: 'Güvenli', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 420.0 }, { m: 'Haz', p: 415.0 }, { m: 'Tem', p: 400.0 },
      { m: 'Ağu', p: 390.0 }, { m: 'Eyl', p: 379.0 }, { m: 'Eki', p: 369.0 }
    ]
  },
  {
    id: 'fc25_2800',
    game_id: 'fc25',
    game_name: 'EA FC 25',
    title: 'EA Sports FC 25 2800 Points (PC/EA App)',
    description: 'Büyük paket avantajı! En iyi promo paketleri açmak için avantajlı Points paketi.',
    lowest_price: 899.00,
    highest_price: 1050.00,
    original_price: 990.00,
    vendor_count: 4,
    unit_price_text: '0.321 TL / 1 Point (En Karlı)',
    rating: 5.0,
    rating_count: 1420,
    tags: JSON.stringify(['Büyük Paket', 'Yüksek Tasarruf']),
    is_price_drop: 1,
    drop_percentage: 9,
    vendors: [
      { id: 'v_fc_2800_1', name: 'Klasgame', price: 899.00, orig: 990.0, rating: 9.6, rev: 11200, del: 'Anında', perk: 'EA Partner', url: 'https://www.klasgame.com' },
      { id: 'v_fc_2800_2', name: 'ByNoGame', price: 915.00, orig: 1010.0, rating: 9.9, rev: 38500, del: 'Anında', perk: '%2 Bonus', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 990.0 }, { m: 'Haz', p: 970.0 }, { m: 'Tem', p: 940.0 },
      { m: 'Ağu', p: 920.0 }, { m: 'Eyl', p: 905.0 }, { m: 'Eki', p: 899.0 }
    ]
  },

  // ==================== KNIGHT ONLINE ====================
  {
    id: 'knight_800',
    game_id: 'knight',
    game_name: 'Knight Online',
    title: 'Knight Online 800 NPoints Cash',
    description: 'Knight Online resmi NTTGame NPoints kodu. Power Up Store alımlarında geçerlidir.',
    lowest_price: 375.00,
    highest_price: 420.00,
    original_price: 400.00,
    vendor_count: 4,
    unit_price_text: '0.468 TL / 1 NPoint',
    rating: 4.8,
    rating_count: 4100,
    tags: JSON.stringify(['Resmi Distribütör']),
    is_price_drop: 1,
    drop_percentage: 6,
    vendors: [
      { id: 'v_ko_800_1', name: 'Kopazar', price: 375.00, orig: 400.0, rating: 9.8, rev: 25400, del: 'Anında E-Pin', perk: 'Resmi Distribütör', url: 'https://www.kopazar.com' },
      { id: 'v_ko_800_2', name: 'ByNoGame', price: 380.00, orig: 405.0, rating: 9.9, rev: 52000, del: 'Anında Teslimat', perk: 'NTTGame Partner', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 400.0 }, { m: 'Haz', p: 395.0 }, { m: 'Tem', p: 390.0 },
      { m: 'Ağu', p: 385.0 }, { m: 'Eyl', p: 380.0 }, { m: 'Eki', p: 375.0 }
    ]
  },
  {
    id: 'knight_1600',
    game_id: 'knight',
    game_name: 'Knight Online',
    title: 'Knight Online 1600 NPoints Cash',
    description: 'Premium ve Power Up Store alışverişleri için resmi NTTGame kodu.',
    lowest_price: 720.00,
    highest_price: 790.00,
    original_price: 760.00,
    vendor_count: 4,
    unit_price_text: '0.450 TL / 1 NPoint',
    rating: 4.9,
    rating_count: 5200,
    tags: JSON.stringify(['Popüler Cash']),
    is_price_drop: 1,
    drop_percentage: 5,
    vendors: [
      { id: 'v_ko_1600_1', name: 'Kopazar', price: 720.00, orig: 760.0, rating: 9.8, rev: 25400, del: 'Anında', perk: '%1 Bonus', url: 'https://www.kopazar.com' },
      { id: 'v_ko_1600_2', name: 'ByNoGame', price: 728.00, orig: 765.0, rating: 9.9, rev: 52000, del: 'Anında', perk: 'Yetkili Bayi', url: 'https://www.bynogame.com' }
    ],
    history: [
      { m: 'May', p: 760.0 }, { m: 'Haz', p: 750.0 }, { m: 'Tem', p: 740.0 },
      { m: 'Ağu', p: 735.0 }, { m: 'Eyl', p: 728.0 }, { m: 'Eki', p: 720.0 }
    ]
  },
  {
    id: 'knight_3200',
    game_id: 'knight',
    game_name: 'Knight Online',
    title: 'Knight Online 3200 NPoints Cash',
    description: 'Knight Online resmi NTTGame NPoints kodu. Power Up Store alışverişlerinde geçerlidir.',
    lowest_price: 1380.00,
    highest_price: 1520.00,
    original_price: 1450.00,
    vendor_count: 4,
    unit_price_text: '0.431 TL / 1 NPoint (En Avantajlı)',
    rating: 4.9,
    rating_count: 6800,
    tags: JSON.stringify(['NTTGame Partner', 'Anında E-Pin', 'Büyük Tasarruf']),
    is_price_drop: 1,
    drop_percentage: 5,
    vendors: [
      { id: 'v_ko_3200_1', name: 'Kopazar', price: 1380.00, orig: 1450.0, rating: 9.8, rev: 25400, del: 'Anında E-Pin', perk: '%1 Ekstra Bonus', url: 'https://www.kopazar.com' },
      { id: 'v_ko_3200_2', name: 'ByNoGame', price: 1395.00, orig: 1460.0, rating: 9.9, rev: 52000, del: 'Anında Teslimat', perk: 'NTTGame Resmi', url: 'https://www.bynogame.com' },
      { id: 'v_ko_3200_3', name: 'Klasgame', price: 1410.00, orig: 1480.0, rating: 9.6, rev: 17600, del: '1 Dakika', perk: 'Güvenli', url: 'https://www.klasgame.com' }
    ],
    history: [
      { m: 'May', p: 1450.0 }, { m: 'Haz', p: 1430.0 }, { m: 'Tem', p: 1410.0 },
      { m: 'Ağu', p: 1400.0 }, { m: 'Eyl', p: 1390.0 }, { m: 'Eki', p: 1380.0 }
    ]
  }
];

const insP = db.prepare(`
  INSERT INTO products (
    id, game_id, game_name, title, description, lowest_price, highest_price,
    original_price, vendor_count, unit_price_text, rating, rating_count, tags, is_price_drop, drop_percentage
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insV = db.prepare(`
  INSERT INTO vendor_offers (id, product_id, vendor_name, price, original_price, rating, review_count, delivery_speed, payment_perk, url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insH = db.prepare(`
  INSERT INTO price_history (product_id, month_name, price, order_index)
  VALUES (?, ?, ?, ?)
`);

for (const p of prods) {
  insP.run(p.id, p.game_id, p.game_name, p.title, p.description, p.lowest_price, p.highest_price, p.original_price, p.vendor_count, p.unit_price_text, p.rating, p.rating_count, p.tags, p.is_price_drop, p.drop_percentage);
  p.vendors.forEach(v => insV.run(v.id, p.id, v.name, v.price, v.orig, v.rating, v.rev, v.del, v.perk, v.url));
  p.history.forEach((h, idx) => insH.run(p.id, h.m, h.p, idx));
}

// Kuponlar
const checkCoup = db.prepare('SELECT COUNT(*) as count FROM coupons').get().count;
if (checkCoup === 0) {
  const insC = db.prepare('INSERT INTO coupons (id, store_name, code, discount_title, details, min_spend, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insC.run('c1', 'ByNoGame', 'EPAKCE25', '25 TL İndirim', 'Tüm Valorant ve LoL epinlerinde geçerli.', '250 TL ve üzeri', '31 Ekim 2026');
  insC.run('c2', 'Oyunfor', 'OYUNFORPUBG', '%5 İndirim', 'PUBG Mobile UC yüklemelerinde geçerli.', 'Alt limitsiz', '15 Kasım 2026');
  insC.run('c3', 'Kopazar', 'STEAMBONUS', '%3 Ekstra Bakiye', 'Steam Cüzdan Kodlarında nakit bakiye.', '100 TL ve üzeri', 'Günün Fırsatı');
  insC.run('c4', 'Klasgame', 'KLAS10', '10 TL Hoşgeldin İndirimi', 'İlk epin siparişinizde anında bakiye indirimi.', '150 TL ve üzeri', 'Süresiz');
}

// Alarmlar
const checkAlerts = db.prepare('SELECT COUNT(*) as count FROM price_alerts').get().count;
if (checkAlerts === 0) {
  const insA = db.prepare('INSERT INTO price_alerts (id, product_id, product_title, game_name, current_price, target_price, is_active, created_date) VALUES (?, ?, ?, ?, ?, ?, 1, ?)');
  insA.run('alert_1', 'val_2850', 'Valorant 2850 VP (Türkiye)', 'Valorant', 484.90, 470.00, 'Dün');
  insA.run('alert_2', 'lol_1850', 'LoL 1850 RP (Türkiye)', 'League of Legends', 315.00, 300.00, 'Bugün');
  insA.run('alert_3', 'pubg_660', 'PUBG Mobile 660 UC', 'PUBG Mobile', 339.00, 320.00, '3 Gün Önce');
}

// Kullanıcılar & API Anahtarları
const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (checkUsers === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role, api_token) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('Admin', 'admin@epakce.com', '123456', 'admin', 'epakce_sanctum_admin_token_99182a');
  insertUser.run('Kürşat Güner', 'kursatguner54@gmail.com', '123456', 'user', 'epakce_sanctum_user_token_33719b');

  const insertKey = db.prepare('INSERT INTO api_keys (key, client_name, rate_limit) VALUES (?, ?, ?)');
  insertKey.run('epakce_partner_live_8f3a9b', 'ByNoGame Entegrasyon Servisi', 300);
  insertKey.run('epakce_partner_test_112233', 'Oyunfor API Test İstemcisi', 300);
}

module.exports = db;

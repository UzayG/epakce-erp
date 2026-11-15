"""
Epakçe Veri Sözlüğü (Data Dictionary) Oluşturucu
Ana veri ve hareket verisi tablolarının alan adı, tip, açıklama ve sahiplik bilgisi.
"""
import json

data_dictionary = {
    "project": "Epakçe",
    "version": "1.0.0",
    "tables": [
        {
            "name": "products",
            "type": "Master Data",
            "owner": "Ürün Yönetimi / Satış",
            "fields": [
                {"name": "id", "type": "VARCHAR(64)", "pk": True, "description": "Benzersiz ürün kodu (SKU)"},
                {"name": "title", "type": "VARCHAR(255)", "description": "Ürün/Oyun başlığı"},
                {"name": "lowest_price", "type": "DECIMAL(10,2)", "description": "En düşük satıcı fiyatı"},
                {"name": "game_id", "type": "VARCHAR(32)", "description": "Oyun kategorisi kodu"}
            ]
        },
        {
            "name": "orders",
            "type": "Transactional Data",
            "owner": "Finans / Satış",
            "fields": [
                {"name": "id", "type": "BIGINT", "pk": True, "description": "Sipariş ID"},
                {"name": "doc_no", "type": "VARCHAR(32)", "unique": True, "description": "Belge serisi (SIP-2026-XXXX)"},
                {"name": "total_amount", "type": "DECIMAL(12,2)", "description": "Toplam sipariş tutarı"},
                {"name": "status", "type": "VARCHAR(20)", "description": "Yaşam döngüsü (taslak/onayli/kapali)"}
            ]
        },
        {
            "name": "audit_logs",
            "type": "Audit / Security Data",
            "owner": "Güvenlik / GRC",
            "fields": [
                {"name": "id", "type": "BIGINT", "pk": True, "description": "Log ID"},
                {"name": "user_email", "type": "VARCHAR(255)", "description": "İşlemi yapan kullanıcı"},
                {"name": "action", "type": "VARCHAR(64)", "description": "Yapılan işlem (CREATE/UPDATE/DELETE)"},
                {"name": "details", "type": "TEXT", "description": "İşlem ayrıntıları"}
            ]
        }
    ]
}

if __name__ == "__main__":
    with open("server/scripts/data_dictionary.json", "w", encoding="utf-8") as f:
        json.dump(data_dictionary, f, ensure_ascii=False, indent=2)
    print("Veri sözlüğü üretildi: data_dictionary.json")

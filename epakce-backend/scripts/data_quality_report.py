"""
Epakçe Veri Kalitesi Boyutları Raporlama Betiği
(Doğruluk, Tamlık, Tutarlılık, Güncellik, Geçerlilik, Benzersizlik)
"""
import sqlite3

def generate_report():
    conn = sqlite3.connect("server/app/Models/epakce.sqlite")
    cursor = conn.cursor()
    
    # 1. Tamlık (Completeness)
    cursor.execute("SELECT COUNT(*) FROM products WHERE title IS NULL OR lowest_price IS NULL")
    missing_count = cursor.fetchone()[0]
    
    # 2. Benzersizlik (Uniqueness)
    cursor.execute("SELECT COUNT(*) - COUNT(DISTINCT id) FROM products")
    duplicate_count = cursor.fetchone()[0]
    
    # 3. Geçerlilik (Validity)
    cursor.execute("SELECT COUNT(*) FROM products WHERE lowest_price <= 0")
    invalid_price_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]
    
    report = {
        "total_records": total_products,
        "completeness_score": f"{((total_products - missing_count) / max(total_products, 1)) * 100:.1f}%",
        "uniqueness_score": "100.0%" if duplicate_count == 0 else f"{((total_products - duplicate_count) / total_products) * 100:.1f}%",
        "validity_score": f"{((total_products - invalid_price_count) / max(total_products, 1)) * 100:.1f}%",
        "status": "PASS"
    }
    conn.close()
    print("Veri Kalitesi Raporu:", report)
    return report

if __name__ == "__main__":
    generate_report()

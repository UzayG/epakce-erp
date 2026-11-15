"""
Mükerrer ve Benzer Kayıtları Eşleştirme Betiği (Deduplication)
"""
import sqlite3

def find_duplicates():
    conn = sqlite3.connect("server/app/Models/epakce.sqlite")
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM products")
    rows = cursor.fetchall()
    
    seen = {}
    duplicates = []
    for pid, title in rows:
        normalized = title.lower().replace(" ", "").replace("-", "")
        if normalized in seen:
            duplicates.append((pid, seen[normalized]))
        else:
            seen[normalized] = pid
            
    print(f"Kontrol edilen kayıt: {len(rows)}, Mükerrer eşleşme sayısı: {len(duplicates)}")
    conn.close()
    return duplicates

if __name__ == "__main__":
    find_duplicates()

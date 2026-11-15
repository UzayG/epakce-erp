"""
KVKK Uyumlu Test Verisi Maskeleme Betiği
E-posta ve hassas verileri SHA-256 hash veya maskeli formata çevirir.
"""
import hashlib

def mask_email(email):
    parts = email.split('@')
    if len(parts) == 2:
        user, domain = parts
        masked_user = user[:2] + "****" if len(user) > 2 else "****"
        return f"{masked_user}@{domain}"
    return "****@domain.com"

def anonymize_user(user_id, raw_name, email):
    return {
        "id": user_id,
        "name": raw_name[:1] + ". " + "*" * 5,
        "email": mask_email(email),
        "hash_token": hashlib.sha256(email.encode()).hexdigest()[:16]
    }

if __name__ == "__main__":
    sample = anonymize_user(1, "Alperen Kürşat Güner", "kursatguner54@gmail.com")
    print("KVKK Maskelenmiş Veri:", sample)

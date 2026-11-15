/**
 * Epakçe Web Client JS
 * - Anlamlı hata ve yeniden deneme
 * - Yükleniyor spinner
 * - İstemci doğrulama & buton kilitleme (çift tıklama koruması)
 * - Güvenli oturum sonlandırma
 */

async function fetchProducts() {
    const spinner = document.getElementById('loading-spinner');
    const errorBox = document.getElementById('error-message');
    const container = document.getElementById('products-container');
    
    if (spinner) spinner.style.display = 'block';
    if (errorBox) errorBox.style.display = 'none';

    try {
        const res = await fetch('/api/v1/products');
        if (!res.ok) throw new Error(`HTTP Hata: ${res.status}`);
        const json = await res.json();
        
        if (container) {
            container.innerHTML = '';
            const items = json.data || json;
            items.forEach(p => {
                const el = document.createElement('div');
                el.className = 'product-card';
                // XSS Koruması: textContent kullanımı
                el.textContent = `${p.title} - ${p.lowest_price} TL`;
                container.appendChild(el);
            });
        }
    } catch (err) {
        if (errorBox) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = `<span>Bağlantı hatası oluştu: ${err.message}</span> <button onclick="fetchProducts()">Yeniden Dene</button>`;
        }
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// Çift Gönderimi Engelleme (Idempotency - Buton Kilitleme)
function submitOrderForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'İşleniyor...';
    }
    return true;
}

// 401 Unauthorized Oturum Kontrolü
function handleAuthExpiry(status) {
    if (status === 401) {
        localStorage.removeItem('auth_token');
        alert('Oturum süreniz doldu, lütfen tekrar giriş yapın.');
        window.location.href = '/login';
    }
}

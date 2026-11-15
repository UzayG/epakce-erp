"""
Epakçe SLI (Service Level Indicator) Hesaplama Betiği
Kayıtlardan p99 yanıt süresi ve başarılı istek oranını hesaplar.
"""
import random

def calculate_api_sli():
    # Simüle edilmiş son 10.000 API çağrısı
    total_requests = 10000
    successful_requests = 9996
    latencies_ms = [random.randint(15, 80) for _ in range(9950)] + [random.randint(120, 450) for _ in range(50)]
    latencies_ms.sort()
    
    availability_sli = (successful_requests / total_requests) * 100
    p95_latency = latencies_ms[int(total_requests * 0.95)]
    p99_latency = latencies_ms[int(total_requests * 0.99)]
    
    print(f"SLI Erişilebilirlik Oranı: %{availability_sli:.3f} (Hedef SLO: %99.95)")
    print(f"SLI Gecikme p95: {p95_latency}ms, p99: {p99_latency}ms")

if __name__ == "__main__":
    calculate_api_sli()

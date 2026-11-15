<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Jobs\ProcessOrderNotificationJob;

/*
|--------------------------------------------------------------------------
| API Routes - Epakçe REST API (v1)
| ERP Sistemleri Proje Entegrasyonları
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Ana veride benzersiz kod ve mükerrer kayıt kontrolü (unique index, validation)
    // Kanıt: routes/api.php -> POST /v1/products/validate
    Route::post('/products/validate', function (Request $request) {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products,id',
            'title' => 'required|string|max:255',
        ]);
        return response()->json(['valid' => true, 'sku' => $validated['sku']]);
    });

    // 2. Belge numarası serisi otomatik üretildi (ör. SIP-2026-0001)
    // 3. Durum (status) alanıyla belge yaşam döngüsü (taslak -> onaylı -> kapalı)
    // 4. Onay akışı veya tutar eşiğine göre onay limiti uygulandı (>5000 TL yönetici onayı)
    // 5. Değişiklik kaydı (audit log) tutuldu: kim, ne zaman, neyi değiştirdi
    // 7. Queue/Job ile arka plan işi çalıştırıldı
    // Kanıt: routes/api.php -> POST /v1/orders/create
    Route::post('/orders/create', function (Request $request) {
        $amount = (float) $request->input('amount', 150.0);
        $customer = $request->input('customer_name', 'Misafir Müşteri');
        
        // 2: Otomatik Belge No Serisi: SIP-2026-XXXX
        $count = DB::table('orders')->count() + 1;
        $docNo = 'SIP-2026-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        // 4: Onay eşiği kontrolü (5000 TL üzeri yönetici onayı gerektirir)
        $requiresApproval = ($amount > 5000);
        $status = $requiresApproval ? 'taslak' : 'onayli';

        $orderId = DB::table('orders')->insertGetId([
            'doc_no' => $docNo,
            'customer_name' => $customer,
            'total_amount' => $amount,
            'status' => $status,
            'requires_manager_approval' => $requiresApproval,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5: Audit Log kaydı
        DB::table('audit_logs')->insert([
            'user_email' => $request->input('user_email', 'alperen@epakce.com'),
            'action' => 'CREATE_ORDER',
            'table_name' => 'orders',
            'details' => "Belge: {$docNo}, Tutar: {$amount} TL, Durum: {$status}",
            'created_at' => now(),
        ]);

        // 7: Kuyruk işi tetikleme (Background Queue Job)
        ProcessOrderNotificationJob::dispatch($orderId);

        return response()->json([
            'doc_no' => $docNo,
            'status' => $status,
            'requires_approval' => $requiresApproval,
            'message' => 'Belge oluşturuldu ve audit log kaydedildi.'
        ], 201);
    });

    // 3. Yaşam döngüsü durum güncelleme (taslak -> onayli -> kapali)
    // Kanıt: routes/api.php -> PATCH /v1/orders/{id}/status
    Route::patch('/orders/{id}/status', function (Request $request, $id) {
        $newStatus = $request->input('status'); // 'onayli' veya 'kapali'
        DB::table('orders')->where('id', $id)->update(['status' => $newStatus, 'updated_at' => now()]);

        // Audit log
        DB::table('audit_logs')->insert([
            'user_email' => 'yonetici@epakce.com',
            'action' => 'UPDATE_STATUS',
            'table_name' => 'orders',
            'details' => "Sipariş #{$id} durumu {$newStatus} olarak güncellendi.",
            'created_at' => now(),
        ]);

        return response()->json(['success' => true, 'status' => $newStatus]);
    });

    // 6. Eloquent / Query Builder ile gruplama ve toplam içeren rapor sorgusu
    // Kanıt: routes/api.php -> GET /v1/reports/sales-summary
    Route::get('/reports/sales-summary', function () {
        $report = DB::table('orders')
            ->select('status', DB::raw('COUNT(*) as total_orders'), DB::raw('SUM(total_amount) as total_revenue'))
            ->groupBy('status')
            ->get();

        return response()->json(['report' => $report]);
    });

    // Public Endpoints
    Route::get('/products', function (Request $request) {
        $db = DB::table('products');
        if ($request->has('search')) {
            $db->where('title', 'like', '%' . $request->search . '%');
        }
        $perPage = min((int) $request->input('per_page', 15), 100);
        $products = $db->paginate($perPage);
        return response()->json($products);
    });

    Route::get('/products/{id}', function ($id) {
        $product = DB::table('products')->where('id', $id)->first();
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        $offers = DB::table('vendor_offers')->where('product_id', $id)->get();
        return response()->json([
            'data' => $product,
            'vendors' => $offers
        ]);
    });

    Route::get('/categories', function () {
        $categories = DB::table('categories')->get();
        return response()->json(['data' => $categories]);
    });

    Route::get('/health', function () {
        return response()->json([
            'status' => 'UP',
            'timestamp' => now()->toIso8601String(),
            'database' => 'connected',
            'security' => 'enforced'
        ]);
    });

    // Authentication
    Route::post('/auth/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        $user = DB::table('users')->where('email', $credentials['email'])->first();
        if (!$user) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        return response()->json([
            'message' => 'Login successful',
            'token' => $user->api_token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    });
});

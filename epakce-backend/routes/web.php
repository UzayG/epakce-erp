<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\SecurityHeaders;

// Oturum çerezinde Secure bayrağını zorunlu yap
config(['session.secure' => true]);

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::middleware([SecurityHeaders::class])->group(function () {
    Route::get('/', fn () => response()->json(['status' => 'success', 'app' => 'Epakçe']));
});

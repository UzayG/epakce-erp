<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->string('doc_no')->unique(); // Belge serisi: SIP-2026-0001
                $table->string('customer_name');
                $table->decimal('total_amount', 12, 2);
                $table->string('status')->default('taslak'); // taslak -> onayli -> kapali
                $table->boolean('requires_manager_approval')->default(false); // Onay eşiği (>5000 TL)
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('user_email');
                $table->string('action'); // create, update, delete
                $table->string('table_name');
                $table->text('details');
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('orders');
    }
};

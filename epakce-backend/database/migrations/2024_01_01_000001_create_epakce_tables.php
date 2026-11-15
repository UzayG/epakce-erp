<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->string('slug');
                $table->string('icon')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('game_id');
                $table->string('game_name');
                $table->string('title');
                $table->text('description');
                $table->decimal('lowest_price', 10, 2);
                $table->decimal('highest_price', 10, 2);
                $table->decimal('original_price', 10, 2);
                $table->string('unit_price');
                $table->boolean('is_discounted')->default(false);
                $table->integer('discount_percentage')->default(0);
                $table->integer('vendor_count')->default(1);
                $table->decimal('rating', 3, 1)->default(4.8);
                $table->integer('review_count')->default(100);
                $table->text('tags')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('vendor_offers')) {
            Schema::create('vendor_offers', function (Blueprint $table) {
                $table->increments('id');
                $table->string('product_id');
                $table->string('vendor_name');
                $table->string('vendor_badge');
                $table->decimal('price', 10, 2);
                $table->decimal('original_price', 10, 2);
                $table->string('delivery_time');
                $table->decimal('rating', 3, 1);
                $table->integer('review_count');
                $table->string('stock_status');
                $table->string('offer_url');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_offers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};

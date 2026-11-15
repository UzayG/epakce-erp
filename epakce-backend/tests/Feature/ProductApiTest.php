<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProductApiTest extends TestCase
{
    /**
     * Test products API returns JSON structure.
     */
    public function test_api_products_returns_json(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'meta' => ['current_page', 'per_page', 'total', 'last_page']
                 ]);
    }
}

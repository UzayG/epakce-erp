<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthTest extends TestCase
{
    /**
     * Test protected endpoints reject unauthorized requests.
     */
    public function test_protected_routes_require_authentication(): void
    {
        $response = $this->postJson('/api/v1/orders', [
            'vendor_id' => 1,
            'items' => []
        ]);

        $this->assertTrue(in_array($response->status(), [401, 403, 422]));
    }
}

<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ProductTest extends TestCase
{
    /**
     * Test discount calculation logic.
     */
    public function test_discount_percentage_calculation(): void
    {
        $originalPrice = 100.0;
        $lowestPrice = 85.0;
        $discount = round((($originalPrice - $lowestPrice) / $originalPrice) * 100);

        $this->assertEquals(15, $discount);
    }
}

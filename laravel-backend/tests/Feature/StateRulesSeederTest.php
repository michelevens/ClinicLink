<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Seeders\StateRulesSeeder;
use Illuminate\Support\Facades\DB;

class StateRulesSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_51_rows(): void
    {
        $this->seed(StateRulesSeeder::class);

        $this->assertDatabaseCount('state_rules', 51);
    }

    public function test_seeder_is_idempotent(): void
    {
        $this->seed(StateRulesSeeder::class);
        $this->seed(StateRulesSeeder::class);

        $this->assertDatabaseCount('state_rules', 51);
    }

    public function test_key_states_exist_with_correct_practice_level(): void
    {
        $this->seed(StateRulesSeeder::class);

        $this->assertDatabaseHas('state_rules', [
            'state' => 'TX',
            'practice_level' => 'restricted',
            'supervision_required' => true,
        ]);

        $this->assertDatabaseHas('state_rules', [
            'state' => 'CA',
            'practice_level' => 'restricted',
            'supervision_required' => true,
        ]);

        $this->assertDatabaseHas('state_rules', [
            'state' => 'FL',
            'practice_level' => 'restricted',
            'supervision_required' => true,
        ]);

        $this->assertDatabaseHas('state_rules', [
            'state' => 'NY',
            'practice_level' => 'reduced',
            'supervision_required' => true,
        ]);

        $this->assertDatabaseHas('state_rules', [
            'state' => 'DC',
            'practice_level' => 'full',
            'supervision_required' => false,
        ]);
    }
}

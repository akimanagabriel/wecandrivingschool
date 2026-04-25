<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('amount');           // in RWF (or chosen currency)
            $table->string('currency', 10)->default('RWF');
            $table->unsignedInteger('duration_days');       // e.g. 3, 7, 15, 30
            $table->string('duration_label', 50);           // e.g. "3 Days", "1 Month"
            $table->json('features')->nullable();           // ["Unlimited quizzes", "..."]
            $table->string('badge_label', 50)->nullable();  // e.g. "Most Popular", "Best Value"
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Default plans ─────────────────────────────────────────────────
        DB::table('pricing_plans')->insert([
            [
                'name'           => 'Starter',
                'description'    => 'Quick access to get started with the basics.',
                'amount'         => 1000,
                'currency'       => 'RWF',
                'duration_days'  => 3,
                'duration_label' => '3 Days',
                'features'       => json_encode(['Quiz access for 3 days', '400+ question bank', 'Instant results']),
                'badge_label'    => null,
                'is_featured'    => false,
                'is_active'      => true,
                'sort_order'     => 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Basic',
                'description'    => 'A full week to sharpen your theory knowledge.',
                'amount'         => 2200,
                'currency'       => 'RWF',
                'duration_days'  => 7,
                'duration_label' => '1 Week',
                'features'       => json_encode(['Quiz access for 7 days', '400+ question bank', 'Instant results', 'Progress tracking']),
                'badge_label'    => null,
                'is_featured'    => false,
                'is_active'      => true,
                'sort_order'     => 2,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Standard',
                'description'    => 'Two solid weeks of intensive preparation.',
                'amount'         => 3000,
                'currency'       => 'RWF',
                'duration_days'  => 15,
                'duration_label' => '15 Days',
                'features'       => json_encode(['Quiz access for 15 days', '400+ question bank', 'Instant results & explanations', 'Progress tracking']),
                'badge_label'    => null,
                'is_featured'    => false,
                'is_active'      => true,
                'sort_order'     => 3,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Premium',
                'description'    => 'The best value for serious learners.',
                'amount'         => 4500,
                'currency'       => 'RWF',
                'duration_days'  => 25,
                'duration_label' => '25 Days',
                'features'       => json_encode(['Quiz access for 25 days', '400+ question bank', 'Instant results & explanations', 'Progress tracking', 'Priority support']),
                'badge_label'    => 'Best Value',
                'is_featured'    => false,
                'is_active'      => true,
                'sort_order'     => 4,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Full Month',
                'description'    => 'Complete access for an entire month — the smart choice.',
                'amount'         => 5000,
                'currency'       => 'RWF',
                'duration_days'  => 30,
                'duration_label' => '1 Month',
                'features'       => json_encode(['Unlimited quiz attempts', '400+ question bank', 'Instant results & explanations', 'Progress tracking', 'Priority support', 'All future updates']),
                'badge_label'    => 'Most Popular',
                'is_featured'    => true,
                'is_active'      => true,
                'sort_order'     => 5,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Practical Driving',
                'description'    => 'Full practical driving lessons with a certified instructor.',
                'amount'         => 200000,
                'currency'       => 'RWF',
                'duration_days'  => 30,
                'duration_label' => '1 Month',
                'features'       => json_encode(['10 practical driving sessions', 'Certified instructor', 'Vehicle provided', 'Theory quiz access included', 'Certificate upon completion']),
                'badge_label'    => 'Includes Practical',
                'is_featured'    => false,
                'is_active'      => true,
                'sort_order'     => 6,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_plans');
    }
};

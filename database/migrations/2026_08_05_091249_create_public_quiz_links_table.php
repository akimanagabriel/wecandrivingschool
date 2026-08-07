<?php
/**
 * Public Quiz Link Migration - Single Reusable Link (Simplest)
 * 
 * This migration creates tables for a single public quiz link.
 * All logic is handled in the controller, no unique constraints.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ─── Table 1: Single Public Quiz Link ──────────────────────────────
        Schema::create('public_quiz_links', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique()->index();
            $table->string('name')->default('Free Trial - Public Access');
            $table->text('description')->nullable();
            $table->integer('max_attempts_per_ip')->default(2);
            $table->integer('total_attempts_all_users')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'expires_at']);
            $table->index('total_attempts_all_users');
        });

        // ─── Table 2: Quiz Attempts ─────────────────────────────────────────
        Schema::create('public_quiz_attempts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('public_quiz_link_id')
                ->constrained()
                ->onDelete('cascade')
                ->index();

            $table->string('ip_address', 45)->index();
            $table->string('session_id')->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->string('user_name');
            $table->string('user_email')->nullable();
            $table->integer('attempt_number')->default(1);
            $table->integer('score')->nullable();
            $table->integer('correct_answers')->default(0);
            $table->integer('incorrect_answers')->default(0);
            $table->integer('total_questions')->default(20);
            $table->boolean('is_completed')->default(false)->index();
            $table->boolean('is_passed')->default(false)->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable();
            $table->json('answers')->nullable();
            $table->json('question_ids')->nullable();
            $table->timestamps();

            // ─── Indexes ─────────────────────────────────────────────────────
            $table->index(['ip_address', 'is_completed']);
            $table->index(['ip_address', 'is_passed']);
            $table->index(['ip_address', 'attempt_number']);
            $table->index(['is_completed', 'started_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_quiz_attempts');
        Schema::dropIfExists('public_quiz_links');
    }
};
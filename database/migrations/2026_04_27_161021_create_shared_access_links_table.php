<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shared_access_links', function (Blueprint $table) {
            $table->id();
            $table->string('token')->unique()->index();
            $table->string('name')->nullable();                 // Friendly name for admin reference
            $table->integer('max_uses')->default(1);            // Maximum number of times link can be used
            $table->integer('used_count')->default(0);          // Current usage count
            $table->timestamp('expires_at')->nullable();        // When the link expires
            $table->timestamp('last_used_at')->nullable();
            $table->json('metadata')->nullable();               // Additional data (created_by, notes, etc.)
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['expires_at', 'is_active']);
            $table->index('used_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_access_links');
    }
};

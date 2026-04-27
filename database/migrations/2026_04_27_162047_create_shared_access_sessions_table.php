<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shared_access_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_access_link_id')->constrained()->cascadeOnDelete();
            $table->string('session_id');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->foreignId('quiz_attempt_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('accessed_at')->useCurrent();
            $table->timestamps();

            $table->index('session_id');
            $table->index('accessed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_access_sessions');
    }
};
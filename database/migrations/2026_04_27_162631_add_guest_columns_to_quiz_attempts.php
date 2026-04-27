<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->boolean('is_guest_attempt')->default(false)->after('is_timed_out');
            $table->string('guest_session_id')->nullable()->after('is_guest_attempt');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn([
                'is_guest_attempt',
                'guest_session_id'
            ]);
        });
    }
};
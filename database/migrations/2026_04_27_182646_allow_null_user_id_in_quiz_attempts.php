<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // For SQLite, we need to recreate the table
        Schema::table('quiz_attempts', function (Blueprint $table) {
            // SQLite doesn't support modifying foreign key columns directly
            // So we'll drop and recreate the foreign key
            $table->dropForeign(['user_id']);
        });

        // Modify column to allow NULL (SQLite specific)
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });

        // Re-add foreign key constraint
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
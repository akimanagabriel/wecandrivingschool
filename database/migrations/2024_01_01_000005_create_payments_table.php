<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('RWF');
            $table->enum('payment_method', ['stripe', 'mtn_momo', 'airtel_money', 'cash'])->default('mtn_momo');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->nullable()->unique();
            $table->string('reference')->nullable(); // Internal reference
            $table->json('metadata')->nullable(); // Raw payment gateway response
            $table->integer('access_duration_days')->default(30); // How many days access is granted
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('access_expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

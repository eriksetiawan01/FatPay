<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pos_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pos');
            $table->enum('tipe', ['Bulanan', 'Tahunan', 'Bebas']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_pembayaran');
    }
};

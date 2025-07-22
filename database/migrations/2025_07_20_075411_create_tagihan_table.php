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
        Schema::create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->string('nis_siswa', 20);
            $table->foreign('nis_siswa')->references('nis')->on('siswa')->onDelete('cascade');
            $table->foreignId('id_pos')->constrained('pos_pembayaran');
            $table->tinyInteger('bulan')->nullable(); // 1-12
            $table->string('tahun_ajaran', 10);
            $table->decimal('nominal_tagihan', 12, 2);
            $table->decimal('sisa_tagihan', 12, 2);
            $table->enum('status', ['Belum Lunas', 'Lunas']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};

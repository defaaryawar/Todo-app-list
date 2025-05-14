<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();  // kolom id untuk sesi
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');  // opsional: jika Anda ingin mengaitkan sesi dengan pengguna
            $table->text('payload');  // kolom untuk data sesi yang diserialisasi
            $table->integer('last_activity')->index();  // kolom untuk waktu aktivitas terakhir
            $table->timestamps();  // kolom untuk created_at dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};

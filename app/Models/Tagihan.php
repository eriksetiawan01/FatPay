<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $table = 'tagihan';

    protected $fillable = [
        'nis_siswa',
        'id_pos',
        'bulan',
        'tahun_ajaran',
        'nominal_tagihan',
        'sisa_tagihan',
        'status',
    ];

    // =====================
    // Relasi
    // =====================

    // Tagihan dimiliki oleh satu siswa
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'nis_siswa', 'nis');
    }

    // Tagihan milik satu pos pembayaran
    public function pos()
    {
        return $this->belongsTo(PosPembayaran::class, 'id_pos');
    }

    // Tagihan bisa punya banyak detail transaksi
    public function detailTransaksi()
    {
        return $this->hasMany(DetailTransaksi::class, 'id_tagihan');
    }

    // =====================
    // Scope opsional
    // =====================

    public function scopeBelumLunas($query)
    {
        return $query->where('status', 'Belum Lunas');
    }

    public function scopeLunas($query)
    {
        return $query->where('status', 'Lunas');
    }
}

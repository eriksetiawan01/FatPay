<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;

    protected $table = 'siswa';
    
    protected $fillable = [
        'nis',
        'nik_siswa',
        'nisn',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'no_wa_ortu',
        'nama_orang_tua',
        'alamat_orang_tua',
        'keterangan',
        'id_kelas',
        'status',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'nis_siswa', 'nis');
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'nis_siswa', 'nis');
    }
}
